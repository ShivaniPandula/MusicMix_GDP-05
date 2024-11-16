const { createPlaylist, updatePlaylist, deletePlaylist, deleteSongInPlaylist, getPlaylist, getAllPlaylists } = require('../src/controllers/publicControllers.js');
const UserModel = require('../src/models/UsersModel.js');
const songModel = require('../src/models/songsModel.js');
const playlistModel = require('../src/models/PlaylistsModel.js')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Emails = require('../src/mails/email.js');

jest.mock('bcryptjs');
jest.mock('../src/models/songsModel.js');
jest.mock('../src/models/PlaylistsModel.js');

describe('Playlist Functions', () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    // Test for createPlaylist function
    describe('createPlaylist function', () => {
        test('should create a playlist successfully with valid data', async () => {
            req.body = { playlistName: 'My Playlist', owner: 'user1', songs: [] };
            playlistModel.prototype.save = jest.fn().mockResolvedValueOnce(req.body);

            await createPlaylist(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.send).toHaveBeenCalledWith({ success: "Playlist created Successfully!" });
        });

        test('should handle error when playlist data is missing', async () => {
            req.body = null;

            await createPlaylist(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ error: "Something went wrong in server!" });
        });

       /*  test('should handle error when an unexpected error occurs', async () => {
            req.body = { playlistName: 'My Playlist', owner: 'user1', songs: [] };
            playlistModel.prototype.save = jest.fn().mockRejectedValueOnce(new Error('Database error'));

            await createPlaylist(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ error: "Something went wrong in server!" });
        }); */
    });

    // Test for updatePlaylist function
    describe('updatePlaylist function', () => {
        test('should update playlist with new song successfully', async () => {
            req.body = { playlistName: 'My Playlist', owner: 'user1', song: 'songId123' };
            playlistModel.updateOne = jest.fn().mockResolvedValueOnce({ modifiedCount: 1 });

            await updatePlaylist(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: "Music added" });
        });

       /*  test('should handle error when playlist not found', async () => {
            req.body = { playlistName: 'My Playlist', owner: 'user1', song: 'songId123' };
            playlistModel.updateOne = jest.fn().mockResolvedValueOnce({ modifiedCount: 0 });

            await updatePlaylist(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: "playlist not found." });
        }); */

       /*  test('should handle server error when updating playlist', async () => {
            req.body = { playlistName: 'My Playlist', owner: 'user1', song: 'songId123' };
            playlistModel.updateOne = jest.fn().mockRejectedValueOnce(new Error('Database error'));

            await updatePlaylist(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ error: 'Database error' });
        });  */
    });

    // Test for getPlaylist function
    describe('getPlaylist function', () => {
        test('should retrieve a playlist successfully', async () => {
            req.query = { playlist: 'My Playlist' };
            const playlist = { playlistName: 'My Playlist', songs: ['songId123'] };
            const songData = [{ songId: 'songId123', title: 'Song Title' }];
            playlistModel.findOne = jest.fn().mockResolvedValueOnce(playlist);
            songModel.find = jest.fn().mockResolvedValueOnce(songData);

            await getPlaylist(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                success: true,
                playlist: playlist,
                songs: songData
            });
        });

        test('should return empty message if no playlist is found', async () => {
            req.query = { playlist: 'NonExisting Playlist' };
            playlistModel.findOne = jest.fn().mockResolvedValueOnce(null);

            await getPlaylist(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ success: false, empty: "No playlist found" });
        });

      /*   test('should handle server error when fetching playlist', async () => {
            req.query = { playlist: 'My Playlist' };
            playlistModel.findOne = jest.fn().mockRejectedValueOnce(new Error('Database error'));

            await getPlaylist(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ error: "Something went wrong on the server!" });
        }); */
    });

    // Test for deleteSongInPlaylist function
    describe('deleteSongInPlaylist function', () => {
        test('should delete song from playlist successfully', async () => {
            req.query = { playlist: 'My Playlist', owner: 'user1', songId: 'songId123' };
            playlistModel.updateOne = jest.fn().mockResolvedValueOnce({ modifiedCount: 1 });

            await deleteSongInPlaylist(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ success: "Music deleted from playlist successfully." });
        });

       /*  test('should handle error when playlist or song not found', async () => {
            req.query = { playlist: 'My Playlist', owner: 'user1', songId: 'songId123' };
            playlistModel.updateOne = jest.fn().mockResolvedValueOnce({ modifiedCount: 0 });

            await deleteSongInPlaylist(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith({ error: "Playlist or song not found." });
        }); 

        test('should handle server error when deleting song from playlist', async () => {
            req.query = { playlist: 'My Playlist', owner: 'user1', songId: 'songId123' };
            playlistModel.updateOne = jest.fn().mockRejectedValueOnce(new Error('Database error'));

            await deleteSongInPlaylist(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ error: "Something went wrong in server!" });
        }); */
    });

    // Test for deletePlaylist function
    describe('deletePlaylist function', () => {
        test('should delete playlist successfully', async () => {
            req.query = { playlist: 'My Playlist', owner: 'user1' };
            playlistModel.deleteOne = jest.fn().mockResolvedValueOnce({ deletedCount: 1 });

            await deletePlaylist(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ success: "Playlist deleted successfully." });
        });

      /*   test('should return error if playlist not found', async () => {
            req.query = { playlist: 'NonExisting Playlist', owner: 'user1' };
            playlistModel.deleteOne = jest.fn().mockResolvedValueOnce({ deletedCount: 0 });

            await deletePlaylist(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith({ success: "Playlist not found." });
        });

        test('should handle server error when deleting playlist', async () => {
            req.query = { playlist: 'My Playlist', owner: 'user1' };
            playlistModel.deleteOne = jest.fn().mockRejectedValueOnce(new Error('Database error'));

            await deletePlaylist(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ error: "Something went wrong on the server!" });
        });  */
    });
});
