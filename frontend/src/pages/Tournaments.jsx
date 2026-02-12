import { useState, useEffect } from 'react';
import { getAllTournaments, createTournament, registerToTournament, getMyTournaments } from '../services/tournamentService';
import { submitReplay } from '../services/matchService';

export default function Tournaments() {
    const [tournaments, setTournaments] = useState([]);
    const [myTournaments, setMyTournaments] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedTournament, setSelectedTournament] = useState('');
    const [replayUrl, setReplayUrl] = useState('');
    const [message, setMessage] = useState('');
    const [result, setResult] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const t = await getAllTournaments();
            setTournaments(t.tournaments);
            const my = await getMyTournaments();
            setMyTournaments(my.tournaments);
        } catch (err) {
            console.log(err);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createTournament(name, description);
            setMessage('Tournament created');
            setName('');
            setDescription('');
            loadData();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error');
        }
    };

    const handleRegister = async (id) => {
        try {
            await registerToTournament(id);
            setMessage('Registered');
            loadData();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await submitReplay(selectedTournament, replayUrl);
            setResult(res);
            setMessage('Replay submitted');
            loadData();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error');
        }
    };

    return (
        <div>
            <h1>Tournaments</h1>

            <h2>Create</h2>
            <form onSubmit={handleCreate}>
                <input type="text" placeholder="Title" value={name} onChange={(e) => setName(e.target.value)} />
                <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                <button type="submit">Create</button>
            </form>

            <h2>All Tournaments</h2>
            {tournaments.map((t) => (
                <div key={t._id}>
                    <p>{t.name} - {t.status} - {t.currentParticipants}/{t.maxParticipants}</p>
                    <button onClick={() => handleRegister(t._id)}>Register</button>
                </div>
            ))}

            <h2>Submit Replay</h2>
            <form onSubmit={handleSubmit}>
                <select value={selectedTournament} onChange={(e) => setSelectedTournament(e.target.value)}>
                    <option value="">Select Tournament</option>
                    {myTournaments.map((t) => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                </select>
                <input type="text" placeholder="Replay URL" value={replayUrl} onChange={(e) => setReplayUrl(e.target.value)} />
                <button type="submit">Submit</button>
            </form>

            {result && (
                <div>
                    <h3>Result</h3>
                    <p>Winner: {result.winner?.username} | MMR: {result.winner?.mmrAfter} (+{result.winner?.mmrChange})</p>
                    <p>Loser: {result.loser?.username} | MMR: {result.loser?.mmrAfter} ({result.loser?.mmrChange})</p>
                </div>
            )}

            {message && <p>{message}</p>}
        </div>
    );
}
