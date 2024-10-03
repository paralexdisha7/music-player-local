import React, { useState, useEffect } from 'react';

const MusicPlayer = () => {
    const [musicList, setMusicList] = useState([]);
    const [selectedMusic, setSelectedMusic] = useState(null);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Fetch music files from backend
    const fetchMusic = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/music');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log('Fetched music files:', data); // Log the fetched data
            setMusicList(data);
        } catch (error) {
            console.error('Error fetching music files:', error);
            alert('Failed to fetch music files. Please try again later.');
        }
    };

    useEffect(() => {
        fetchMusic(); // Fetch music files from the backend on component mount
    }, []);

    const handleMusicSelect = (music) => {
        console.log(music); // Add this line
        setSelectedMusic(music);
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('music', file);

        try {
            const response = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                alert('File uploaded successfully!');
                fetchMusic(); // Refresh music list after upload
            } else {
                alert('Error uploading file');
            }
        } catch (error) {
            console.error('Error during file upload:', error);
            alert('Upload failed. Please try again later.');
        }
        setUploading(false);
    };

    const handleDelete = async (key) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this song?');
        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://localhost:5000/api/music/${key}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('Song deleted successfully!');
                fetchMusic(); // Refresh music list after delete
            } else {
                alert('Error deleting song');
            }
        } catch (error) {
            console.error('Error during song deletion:', error);
            alert('Delete failed. Please try again later.');
        }
    };

    return (
        <div className="flex flex-col h-screen w-screen bg-gray-200 p-6 overflow-hidden">
            {/* Music List */}
            <div className="flex flex-1 flex-col md:flex-row bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="w-full p-4 border-b flex-1">
                    <h2 className="text-3xl font-bold text-blue-700 mb-5 text-center">Music List</h2>
                    <ul className="space-y-2">
                        {musicList.map((music) => (
                            <li
                                key={music.key}
                                className="cursor-pointer hover:bg-blue-200 transition duration-300 p-3 rounded-lg text-gray-700 font-semibold text-center flex justify-between items-center"
                            >
                                <span onClick={() => handleMusicSelect(music)}>{music.key}</span>
                                <button
                                    onClick={() => handleDelete(music.key)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Upload Music */}
            <form onSubmit={handleUpload} className="my-4">
                <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">Upload Music</h2>
                <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="border-2 border-blue-600 rounded-lg p-3 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                />
                <button
                    type="submit"
                    className="w-full h-12 bg-blue-600 text-white rounded-lg transition-opacity duration-300 hover:opacity-80 disabled:opacity-50"
                    disabled={uploading}
                >
                    {uploading ? 'Uploading...' : 'Upload Music'}
                </button>
            </form>

            {/* Music Player Section */}
            <div className="p-4 border-t border-gray-300 bg-white shadow-lg rounded-lg mt-4">
                {selectedMusic ? (
                    <>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Now Playing: {selectedMusic.key}</h3>
                        <audio controls src={selectedMusic.url} className="w-full">
                            Your browser does not support the audio element.
                        </audio>
                    </>
                ) : (
                    <p className="text-gray-500 text-center">Select a song to play</p>
                )}
            </div>
        </div>
    );
};

export default MusicPlayer;
