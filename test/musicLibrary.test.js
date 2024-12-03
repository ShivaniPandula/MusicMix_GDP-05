const { updateProfile, getSongs } = require('../src/controllers/publicControllers.js');
const UserModel = require('../src/models/UsersModel.js');
const songModel = require('../src/models/songsModel.js')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Emails = require('../src/mails/email.js');

jest.mock('bcryptjs');
jest.mock('../src/models/songsModel.js');
jest.mock('jsonwebtoken');
jest.mock('../src/mails/email.js');


describe('getMusic function', () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        jest.clearAllMocks();
    });

    test('should retrieve music successfully', async () => {
        const songs = [
            { title: 'Song 1', artist: 'Artist 1' },
            { title: 'Song 2', artist: 'Artist 2' }
        ];

        songModel.find = jest.fn().mockResolvedValueOnce(songs);

        await getSongs(req, res);

        expect(songModel.find).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({ success: true, songs });
    });

   /* test('should return success as false when no music are found', async () => {
        songModel.find = jest.fn().mockResolvedValueOnce([]);

        await getSongs(req, res);

        expect(songModel.find).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({ success: false, empty: "No songs found" });
    }); */

   /*  test('should handle server error', async () => {
        const error = new Error('Database error');
        songModel.find = jest.fn().mockRejectedValueOnce(error);

        await getSongs(req, res);

        expect(songModel.find).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(300);
        expect(res.send).toHaveBeenCalledWith({ error: "Something went wrong with server" });
    }); */
});
