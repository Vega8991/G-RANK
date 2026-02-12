import { useState, useEffect } from 'react';
import { getAllTournaments, createTournament, registerToTournament, getMyTournaments } from '../services/tournamentService';
import { submitReplay } from '../services/matchService';

export default function Tournaments() {
    const [tournaments, setTournaments] = useState([]);
    const [myTournaments, setMyTournaments] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedTournament, setSelectedTournaments] = useState('');
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
        }catch(err){
            console.log(err);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try{
            await createTournament(title, description);
            setMessage('Tournament created');
            setTitle('');
            setDescription('');
            loadData();
        }catch(err){
            setMessage(err.response?.data?.message || 'Error');
        }
    };

    const handleRegister = async (id) => {
        try {
            await registerToTournament(id);
            setMessage('Registered');
            loadData();
        }catch(err){
            setMessage(err.response?.data?.message || 'Error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const res = await submitReplay(selectedTournament, replayUrl);
            setResult(res);
            setMessage('Replay submitted');
            loadData();
        }catch(err){
            setMessage(err.response?.data?.message || 'Error');
        }
    };

    return(
        <div>
            <h1>Tournaments</h1>

            <h2>Create tournament</h2>
            <form onSubmit={handleCreate}>
                <input type="text" placeholder='Title' value={title} onChange={(e) => setTitle(e.target.value)} required />
                <input type="text" placeholder='Description' value={description} onChange={(e) => setDescription(e.target.value)} required />
                <button type='submit'>Create tournament</button>
            </form>

            <h2>All tournaments</h2>
            {tournaments.map((t) => (
                <div key={t._id}>
                <h3>{t.title}</h3>
                <p>{t.description}</p>
                <p>Status: {t.status}</p>
                <p>Participants: {t.currentParticipants}/{t.maxParticipants}</p>
                <button onClick={() => handleRegister(t._id)}>Register</button>
                </div>
            ))}

            <h2>Submit replay</h2>
            <form onSubmit={handleSubmit}>
                <select value={selectedTournament} onChange={(e) => setSelectedTournaments(e.target.value)} required>
                    <option value="">Select tournament</option>
                    {myTournaments.map((t) => (
                        <option key={t._id} value={t._id}>{t.title}</option>
                    ))}
                </select>
                <input type="text" placeholder='Replay URL' value={replayUrl} onChange={(e) => setReplayUrl(e.target.value)} required />
                <button type='submit'>Submit replay</button>
            </form>

            {result && (
                <div>
                    <h3>Replay result</h3>
                    <p>Winner: {result.winner?.username} | MMR: {result.winner?.mmrAfter}(+{result.loser?.mmrChange})</p>
                </div>
            )}

            {message && <p>{message}</p>}
        </div>
    )
}