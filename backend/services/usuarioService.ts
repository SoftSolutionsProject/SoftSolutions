import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Usuario, { IUsuario } from '../models/Usuario';
import { AppError } from '../utils/AppError';

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

// gerar token JWT
const generateToken = (user: { _idUser: number; tipo: string }) => {
  return jwt.sign(
    { _idUser: user._idUser, tipo: user.tipo },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const cadastrarUsuario = async (userData: Partial<IUsuario>): Promise<{ user: IUsuario; token: string }> => {
  // Validação de CPF
  if (!validarCPF(String(userData.cpfUsuario))) {
    throw new AppError('CPF inválido. Por favor, insira um CPF válido no formato ###.###.###-##', 400);
  }

  // Validação de formato do e-mail
  if (!validarEmail(String(userData.email))) {
    throw new AppError('Formato de email inválido. Por favor, insira um email válido.', 400);
  }

  // Validação de formato de telefone
  if (userData.telefone) {
    if (!validarTelefone(userData.telefone)) {
      throw new AppError('Formato de telefone inválido. Insira um número com 10 ou 11 dígitos.', 400);
    }
    userData.telefone = formatarTelefone(userData.telefone); // Formata o telefone
  }

  try {
    // Verificar se o e-mail já está cadastrado
    const emailExistente = await Usuario.findOne({ email: userData.email });
    if (emailExistente) {
      throw new AppError('Email já cadastrado. Por favor, use outro email.', 400);
    }

    // Gerar ID único
    const lastUser = await Usuario.findOne().sort({ _idUser: -1 });
    const _idUser = (lastUser?._idUser || 0) + 1;

    // Hash da senha
    const hashedPassword = await bcrypt.hash(userData.senha!, 10);

    // Força o tipo como aluno
    const novoUsuario = new Usuario({
      ...userData,
      _idUser,
      tipo: 'aluno', // Garante que o tipo seja sempre aluno
      senha: hashedPassword,
    });

    const user = await novoUsuario.save();
    const token = generateToken({ _idUser: user._idUser, tipo: user.tipo });

    return { user, token };
  } catch (error: any) {
    if (error.code === 11000 && error.keyPattern?.cpfUsuario) {
      throw new AppError('CPF já cadastrado. Por favor, use outro CPF.', 400);
    }
    throw error;
  }
};



export const login = async (email: string, senha: string): Promise<{ user: IUsuario; token: string }> => {
  const user = await Usuario.findOne({ email });
  if (!user) {
    throw new AppError('Email ou senha inválidos', 401);
  }

  const senhaValida = await bcrypt.compare(senha, user.senha);
  if (!senhaValida) {
    throw new AppError('Email ou senha inválidos', 401);
  }

  const token = generateToken({ _idUser: user._idUser, tipo: user.tipo });
  return { user, token };
};

export const obterUsuario = async (idUser: number): Promise<IUsuario | null> => {
  const usuario = await Usuario.findOne({ _idUser: idUser });
  if (!usuario) {
    throw new AppError('Usuário não encontrado', 404);
  }
  return usuario;
};

export const atualizarUsuario = async (idUser: number, data: Partial<IUsuario>): Promise<IUsuario | null> => {
  const usuarioAtual = await Usuario.findOne({ _idUser: idUser });
  if (!usuarioAtual) {
    throw new AppError('Usuário não encontrado', 404);
  }

  // Bloquear alteração de CPF
  if ('cpfUsuario' in data && data.cpfUsuario !== usuarioAtual.cpfUsuario) {
    throw new AppError('Não é permitido alterar o CPF', 400);
  }

  // Validação de e-mail
  if (data.email && !validarEmail(data.email)) {
    throw new AppError('Formato de email inválido', 400);
  }

  // Validação e formatação do telefone
  if (data.telefone) {
    if (!validarTelefone(data.telefone)) {
      throw new AppError('Formato de telefone inválido. Insira um número com 10 ou 11 dígitos.', 400);
    }
    // Substitui o telefone pelo valor formatado
    data.telefone = formatarTelefone(data.telefone);
  }

  const usuarioAtualizado = await Usuario.findOneAndUpdate(
    { _idUser: idUser },
    data,
    { new: true }
  );

  return usuarioAtualizado;
};


// Validação de CPF
const validarCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(cpf.charAt(10));
};

// Validação de E-mail
const validarEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailRegex.test(email);
};


const validarTelefone = (telefone: string): boolean => {
  // Remove caracteres não numéricos
  const somenteNumeros = telefone.replace(/\D/g, '');

  // Verifica se o número tem 10 ou 11 dígitos
  return somenteNumeros.length === 10 || somenteNumeros.length === 11;
};

const formatarTelefone = (telefone: string): string => {
  // Remove caracteres não numéricos
  const somenteNumeros = telefone.replace(/\D/g, '');

  if (somenteNumeros.length === 11) {
    // Formata celular com DDD: (11) 91234-5678
    return somenteNumeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (somenteNumeros.length === 10) {
    // Formata fixo com DDD: (11) 1234-5678
    return somenteNumeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  // Retorna o telefone sem formatação se inválido
  return telefone;
};
