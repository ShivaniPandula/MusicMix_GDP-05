const { updateProfile } = require('../src/controllers/publicControllers.js');
const UserModel = require('../src/models/UsersModel.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Emails = require('../src/mails/email.js');

jest.mock('bcryptjs');
jest.mock('../src/models/UsersModel.js');
jest.mock('jsonwebtoken');
jest.mock('../src/mails/email.js');


describe('updateProfile function', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should update profile successfully with valid data', async () => {
        const req = {
            body: { user: 'testuser@example.com', name: 'Test User', email: 'newemail@example.com', address: '123 Street', dob: '1990-01-01' },
            file: { path: 'uploads/test-image.jpg' }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };

        const user = { 
            name: 'Old Name', 
            email: 'oldemail@example.com', 
            address: 'Old Address', 
            dob: '1980-01-01', 
            profileUrl: 'old-image.jpg',
            save: jest.fn().mockResolvedValueOnce() 
        };

        UserModel.findByEmail = jest.fn().mockResolvedValueOnce(user);

        await updateProfile(req, res);  // Directly calling updateProfile without router.handle

        expect(UserModel.findByEmail).toHaveBeenCalledWith('testuser@example.com');
        expect(user.name).toBe('Test User');
        expect(user.email).toBe('newemail@example.com');
        expect(user.address).toBe('123 Street');
        expect(user.dob).toBe('1990-01-01');
        expect(user.profileUrl).toBe('uploads/test-image.jpg');
        expect(user.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({ success: "Profile edited successfully", user });
    });

    test('should not update profile when required data is missing', async () => {
        const req = {
            body: { user: 'testuser@example.com' }, // Missing name, email, address, dob
            file: { path: 'uploads/test-image.jpg' }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };

        UserModel.findByEmail = jest.fn().mockResolvedValueOnce(null);

        await updateProfile(req, res);  // Directly calling updateProfile

        expect(UserModel.findByEmail).toHaveBeenCalledWith('testuser@example.com');
        expect(res.status).toHaveBeenCalledWith(300);
        expect(res.send).toHaveBeenCalledWith({ success: "Profile not found" });
    });

    test('should update profile picture successfully', async () => {
        const req = {
            body: { user: 'testuser@example.com', name: 'Test User', email: 'testuser@example.com', address: '123 Street', dob: '1990-01-01' },
            file: { path: 'uploads/new-profile-pic.jpg' }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };

        const user = { 
            name: 'Test User', 
            email: 'testuser@example.com', 
            address: '123 Street', 
            dob: '1990-01-01', 
            profileUrl: 'old-profile-pic.jpg', 
            save: jest.fn().mockResolvedValueOnce()
        };

        UserModel.findByEmail = jest.fn().mockResolvedValueOnce(user);

        await updateProfile(req, res);  // Directly calling updateProfile

        expect(UserModel.findByEmail).toHaveBeenCalledWith('testuser@example.com');
        expect(user.profileUrl).toBe('uploads/new-profile-pic.jpg');
        expect(user.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({ success: "Profile edited successfully", user });
    });
});

