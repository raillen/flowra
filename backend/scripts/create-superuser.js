import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import readline from 'readline';
import { logger } from '../src/config/logger.js';

/**
 * Script to create a superuser/admin account
 * Allows interactive creation or uses command line arguments
 * 
 * Usage:
 *   node scripts/create-superuser.js
 *   node scripts/create-superuser.js --email admin@example.com --name "Admin" --password "secret123" --role admin
 * 
 * @module scripts/create-superuser
 */

const prisma = new PrismaClient();

/**
 * Prompts user for input
 */
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

/**
 * Validates email format
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Creates a superuser
 */
async function createSuperuser(email, name, password, role = 'admin') {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      logger.warn({ email }, 'User already exists. Updating to superuser...');
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          name,
          password: hashedPassword,
          role,
        },
      });

      logger.info(
        { userId: updatedUser.id, email, role },
        'User updated to superuser'
      );
      return updatedUser;
    }

    // Create new superuser
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
      },
    });

    logger.info({ userId: user.id, email, role }, 'Superuser created successfully');
    return user;
  } catch (error) {
    logger.error({ error }, 'Error creating superuser');
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  let email, name, password, role = 'admin';

  if (args.length > 0) {
    // Parse arguments
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--email' && args[i + 1]) {
        email = args[i + 1];
        i++;
      } else if (args[i] === '--name' && args[i + 1]) {
        name = args[i + 1];
        i++;
      } else if (args[i] === '--password' && args[i + 1]) {
        password = args[i + 1];
        i++;
      } else if (args[i] === '--role' && args[i + 1]) {
        role = args[i + 1];
        i++;
      }
    }
  }

  // Interactive mode if arguments not provided
  if (!email || !name || !password) {
    console.log('\n🔐 Criar Superuser/Admin\n');
    console.log('Preencha os dados abaixo (ou pressione Ctrl+C para cancelar)\n');

    if (!email) {
      email = await prompt('Email: ');
      while (!isValidEmail(email)) {
        console.log('❌ Email inválido. Tente novamente.');
        email = await prompt('Email: ');
      }
    }

    if (!name) {
      name = await prompt('Nome: ');
      while (!name.trim()) {
        console.log('❌ Nome é obrigatório.');
        name = await prompt('Nome: ');
      }
    }

    if (!password) {
      password = await prompt('Senha: ');
      while (password.length < 6) {
        console.log('❌ Senha deve ter no mínimo 6 caracteres.');
        password = await prompt('Senha: ');
      }

      const confirmPassword = await prompt('Confirmar senha: ');
      if (password !== confirmPassword) {
        console.log('❌ Senhas não coincidem. Operação cancelada.');
        process.exit(1);
      }
    }

    if (!role) {
      const roleInput = await prompt('Role (admin/superuser/user) [admin]: ');
      role = roleInput.trim() || 'admin';
    }
  }

  // Validate inputs
  if (!isValidEmail(email)) {
    logger.error('Invalid email format');
    process.exit(1);
  }

  if (!name || !name.trim()) {
    logger.error('Name is required');
    process.exit(1);
  }

  if (!password || password.length < 6) {
    logger.error('Password must be at least 6 characters');
    process.exit(1);
  }

  // Create superuser
  try {
    const user = await createSuperuser(email, name, password, role);
    
    console.log('\n✅ Superuser criado com sucesso!\n');
    console.log('📋 Detalhes:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Nome: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Criado em: ${user.createdAt}\n`);
    console.log('💡 Você pode fazer login com essas credenciais.\n');
  } catch (error) {
    console.error('\n❌ Erro ao criar superuser:', error.message);
    process.exit(1);
  }
}

main()
  .catch((error) => {
    logger.error({ error }, 'Unexpected error');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

