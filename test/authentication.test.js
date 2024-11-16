const { login, register, resetPasswordRequest } = require('../src/controllers/publicControllers.js');
const UserModel = require('../src/models/UsersModel.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Emails = require('../src/mails/email.js');

jest.mock('bcryptjs');
jest.mock('../src/models/UsersModel.js');
jest.mock('jsonwebtoken');
jest.mock('../src/mails/email.js');

// Login Test cases
describe('login function', () => {
  let req, res, userMock;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    // Mock user data
    userMock = {
      password: 'hashed_password',
      isBlocked: false,
      genAuthToken: jest.fn(),
    };
  });

  it('should return 404 if email is incorrect', async () => {
    UserModel.findByEmail.mockResolvedValue(null);

    req.body = { email: 'wrong@example.com', password: 'password123' };

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({ error: 'Incorrect Email' });
  });

  it('should return 300 if password is incorrect', async () => {
    UserModel.findByEmail.mockResolvedValue(userMock);
    bcrypt.compare.mockResolvedValue(false); // Simulate password mismatch

    req.body = { email: 'usertestmail123@gmail.com', password: 'wrongpassword' };

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(300);
    expect(res.send).toHaveBeenCalledWith({ error: 'Incorrect Password' });
  });

  it('should return 300 if user is blocked', async () => {
    userMock.isBlocked = true; // User is blocked
    UserModel.findByEmail.mockResolvedValue(userMock);
    bcrypt.compare.mockResolvedValue(true); // Correct password

    req.body = { email: 'usertestmail123@gmail.com', password: 'nav123' };

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(300);
    expect(res.send).toHaveBeenCalledWith({ error: 'Your account has been restricted by an admin!' });
  });

  it('should return 201 with a token and user if login is successful', async () => {
    userMock.genAuthToken.mockResolvedValue('mock_token');
    UserModel.findByEmail.mockResolvedValue(userMock);
    bcrypt.compare.mockResolvedValue(true); // Correct password

    req.body = { email: 'usertestmail123@gmail.com', password: 'nav123' };

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      success: 'Login success',
      token: 'mock_token',
      user: userMock,
    });
  });

  it('should generate a token for 30 days if query is present', async () => {
    userMock.genAuthToken.mockResolvedValue('mock_token_30_days');
    UserModel.findByEmail.mockResolvedValue(userMock);
    bcrypt.compare.mockResolvedValue(true); // Correct password

    req.body = { email: 'usertestmail123@gmail.com', password: 'nav123' };
    req.query = { rememberMe: true }; // Simulate query param

    await login(req, res);

    expect(userMock.genAuthToken).toHaveBeenCalledWith('30 days');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      success: 'Login success',
      token: 'mock_token_30_days',
      user: userMock,
    });
  });

  it('should return 500 if there is a server error', async () => {
    UserModel.findByEmail.mockImplementation(() => {
      throw new Error('Database error');
    });

    req.body = { email: 'usertestmail123@gmail.com', password: 'nav123' };

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: 'Something went wrong in server!' });
  });
});

// Register Test Cases
describe('register function', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'securepassword'
      },
      file: { path: 'uploads/profile.png' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create a user successfully', async () => {
    UserModel.mockImplementation(() => ({
      save: jest.fn().mockResolvedValueOnce({})
    }));

    await register(req, res);

    expect(UserModel).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({ success: "Registered Successfully!" });
  });

  test('should return error if req.body is missing', async () => {
    req.body = null;

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: "Something went wrong in server!" });
  });

  /* test('should handle errors during user creation', async () => {
    UserModel.mockImplementation(() => ({
      save: jest.fn().mockRejectedValueOnce(new Error('Database error'))
    }));

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: "Something went wrong in server!" });
  }); */
});

// Reset Password
describe('resetPasswordRequest function', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: { email: 'testuser@example.com' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    process.env.IP = 'localhost';
    process.env.PORT = '4040';
    process.env.Jwt_Secret = 'thisissecret';
    global.btoa = (str) => Buffer.from(str).toString('base64');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should send a password reset link successfully', async () => {
      const user = {
        email: 'testuser@example.com',
        id: '12345',
        password: 'hashedpassword'
      };

      UserModel.findByEmail.mockResolvedValueOnce(user);
      jwt.sign.mockReturnValueOnce('mocked_jwt_token');
      Emails.sendResetLink.mockResolvedValueOnce();

      await resetPasswordRequest(req, res);

      const expectedSecret = process.env.Jwt_Secret + user.password;
      const expectedPayload = { email: user.email, id: user.id };

      expect(UserModel.findByEmail).toHaveBeenCalledWith(req.body.email);
      expect(jwt.sign).toHaveBeenCalledWith(expectedPayload, expectedSecret, { expiresIn: '30m' });

      const encodedLink = btoa(`id=${user.id}&token=mocked_jwt_token`);
      const expectedLink = `http://${process.env.IP}:${process.env.PORT || 4040}/resetpassword.html?${encodedLink}`;
      
      expect(Emails.sendResetLink).toHaveBeenCalledWith(user.email, expectedLink);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ success: "Password reset link sent to mail id" });
  });


  test('should return error if user is not found', async () => {
    UserModel.findByEmail.mockResolvedValueOnce(null);

    await resetPasswordRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: "Unable to reset password" });
  });

 /*  test('should handle errors during reset password request', async () => {
    UserModel.findByEmail.mockRejectedValueOnce(new Error('Database error'));

    await resetPasswordRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: "Unable to reset password" });
  }); */

 /*  test('should return 404 if email is not registered', async () => {
    const req = {
        body: { email: 'unregistered@example.com' }
    };
    const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
    };

    UserModel.findByEmail.mockResolvedValueOnce(null);

    await resetPasswordRequest(req, res);

    expect(UserModel.findByEmail).toHaveBeenCalledWith(req.body.email);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({ error: "Email not registered" });
}); */

});


