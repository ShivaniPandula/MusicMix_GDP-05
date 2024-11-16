const { getRecommendedSongs, getLikes, likeSong } = require('../src/controllers/publicControllers.js');
const userModel = require('../src/models/UsersModel.js');
const songModel = require('../src/models/songsModel.js')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Emails = require('../src/mails/email.js');

jest.mock('bcryptjs');
jest.mock('../src/models/songsModel.js');
jest.mock('jsonwebtoken');
jest.mock('../src/mails/email.js');


describe('likeSong', () => {
    it('should add a song to liked songs if not already liked', async () => {
        const req = {
            query: {
                user: 'testuser@example.com',
                id: 'song1',
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };

        userModel.findByEmail = jest.fn().mockResolvedValue({
            likedSongs: [],
            save: jest.fn().mockResolvedValue(true),
        });

        await likeSong(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalled();
    });

    it('should remove a song from liked songs if already liked', async () => {
        const req = {
            query: {
                user: 'testuser@example.com',
                id: 'song1',
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };

        userModel.findByEmail = jest.fn().mockResolvedValue({
            likedSongs: ['song1'],
            save: jest.fn().mockResolvedValue(true),
        });

        await likeSong(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalled();
    });

   /*  it('should return 404 if user not found', async () => {
        const req = {
            query: {
                user: 'testuser@example.com',
                id: 'song1',
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };

        userModel.findByEmail = jest.fn().mockResolvedValue(null);

        await likeSong(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({ message: "getUser not found." });
    }); */
});

describe('getLikes', () => {
    it('should return the list of liked songs for the user', async () => {
        const req = {
            query: {
                user: 'testuser@example.com',
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        userModel.findByEmail = jest.fn().mockResolvedValue({
            likedSongs: ['song1', 'song2'],
        });

        await getLikes(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ list: ['song1', 'song2'] });
    });

  /*   it('should return 404 if user not found', async () => {
        const req = {
            query: {
                user: 'testuser@example.com',
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        userModel.findByEmail = jest.fn().mockResolvedValue(null);

        await getLikes(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "User not found." });
    }); */
});


describe('getRecommendedSongs', () => {
    it('should return recommendations based on liked genres', async () => {
        // Sample data
        const userId = 'testuser@example.com';
        const likedSongs = ['song1', 'song2', 'song3'];
        const songGenres = {
            song1: 'Pop',
            song2: 'Rock',
            song3: 'Pop',
        };

        userModel.findOne = jest.fn().mockResolvedValue({
            likedSongs,
        });

        songModel.find = jest.fn().mockResolvedValue([
            { songId: 'song4', genre: 'Pop' },
            { songId: 'song5', genre: 'Pop' },
            { songId: 'song6', genre: 'Rock' },
        ]);

        // Mock the getSongGenre function
        const getSongGenre = jest.fn().mockImplementation((songId) => {
            return Promise.resolve(songGenres[songId]);
        });

        // Call the getRecommendedSongs function
        const req = { query: { id: userId } };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };

        await getRecommendedSongs(req, res);

        // Check if the status is 200 and recommendations are returned based on genre
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            message: "Personal recommendations fetched based on your liked genres",
            songs: [
                { songId: 'song4', genre: 'Pop' },
                { songId: 'song5', genre: 'Pop' },
                { songId: 'song6', genre: 'Rock' },
            ],
        });
});

});



