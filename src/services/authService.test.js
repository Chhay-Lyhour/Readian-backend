import { registerUser } from './authService';
import * as authRepositories from '../repositories/authRepositories';
import * as emailService from './email';
import bcrypt from 'bcryptjs';
import { AppError } from '../utils/errorHandler';

// Mock the dependencies
jest.mock('../repositories/authRepositories');
jest.mock('./email');
jest.mock('bcryptjs');

describe('Auth Service - registerUser', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    // Mock the return values of the dependencies
    authRepositories.findUserByEmail.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashedpassword');
    authRepositories.createUser.mockResolvedValue({
      id: '123',
      ...userData,
      password: 'hashedpassword',
    });
    emailService.sendVerificationEmail.mockResolvedValue();

    const result = await registerUser(userData);

    expect(authRepositories.findUserByEmail).toHaveBeenCalledWith(userData.email);
    expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 12);
    expect(authRepositories.createUser).toHaveBeenCalledWith({
      ...userData,
      password: 'hashedpassword',
    });
    expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
      userData.email,
      userData.name
    );
    expect(result).toEqual({
      message: 'Registration successful. Please check your email.',
      userId: '123',
    });
  });

  it('should throw an error if the email already exists', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    // Mock that the user already exists
    authRepositories.findUserByEmail.mockResolvedValue({ email: userData.email });

    await expect(registerUser(userData)).rejects.toThrow(
      new AppError('EMAIL_ALREADY_EXISTS')
    );

    expect(authRepositories.findUserByEmail).toHaveBeenCalledWith(userData.email);
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(authRepositories.createUser).not.toHaveBeenCalled();
    expect(emailService.sendVerificationEmail).not.toHaveBeenCalled();
  });
});
