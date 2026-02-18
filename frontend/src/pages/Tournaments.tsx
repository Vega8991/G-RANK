import { useState, useEffect, useRef } from 'react';
import { getAllTournaments, createTournament, registerToTournament, getMyTournaments, syncParticipantCounts } from '../services/tournamentService';
import { submitReplay } from '../services/matchService';
import { Calendar } from 'lucide-react';
import type { Tournament, MatchResultResponse } from '../types';
import { AxiosError } from 'axios';

export default function Tournaments() {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [myTournaments, setMyTournaments] = useState<Tournament[]>([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [registrationDeadline, setRegistrationDeadline] = useState('');
    const [matchDateTime, setMatchDateTime] = useState('');
    const [selectedTournament, setSelectedTournament] = useState('');
    const [replayUrl, setReplayUrl] = useState('');
    const [message, setMessage] = useState('');
    const [result, setResult] = useState<MatchResultResponse | null>(null);
    const registrationDeadlineRef = useRef<HTMLInputElement>(null);
    const matchDateTimeRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            await syncParticipantCounts();
            const t = await getAllTournaments();
            setTournaments(t.tournaments || []);
            const my = await getMyTournaments();
            setMyTournaments(my.tournaments || []);
        } catch (err) {
            console.error('Error loading tournaments:', err);
            const axiosErr = err as AxiosError<{ message?: string }>;
            setMessage(axiosErr.response?.data?.message || 'Error loading tournaments');
        }
    };

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await createTournament(name, description, registrationDeadline, matchDateTime);
            setMessage('Tournament created');
            setName('');
            setDescription('');
            setRegistrationDeadline('');
            setMatchDateTime('');
            loadData();
        } catch (err) {
            const axiosErr = err as AxiosError<{ message?: string }>;
            setMessage(axiosErr.response?.data?.message || 'Error');
        }
    };

    const handleRegister = async (id: string) => {
        try {
            await registerToTournament(id);
            setMessage('Registered');
            loadData();
        } catch (err) {
            const axiosErr = err as AxiosError<{ message?: string }>;
            setMessage(axiosErr.response?.data?.message || 'Error');
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const res = await submitReplay(selectedTournament, replayUrl);
            setResult(res);
            setMessage('Replay submitted');
            loadData();
        } catch (err) {
            const axiosErr = err as AxiosError<{ message?: string }>;
            setMessage(axiosErr.response?.data?.message || 'Error');
        }
    };

    return (
        <div>
            <h1>Tournaments</h1>

            <h2>Create</h2>
            <form onSubmit={handleCreate}>
                <input type="text" placeholder="Title" value={name} onChange={(e) => setName(e.target.value)} required />
                <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <Calendar 
                        size={18} 
                        onClick={() => registrationDeadlineRef.current?.showPicker()} 
                        style={{ cursor: 'pointer' }}
                    />
                    Registration Deadline:
                    <input 
                        ref={registrationDeadlineRef}
                        type="datetime-local" 
                        value={registrationDeadline} 
                        onChange={(e) => setRegistrationDeadline(e.target.value)} 
                        style={{ cursor: 'pointer', padding: '4px 8px' }}
                        required 
                    />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <Calendar 
                        size={18} 
                        onClick={() => matchDateTimeRef.current?.showPicker()} 
                        style={{ cursor: 'pointer' }}
                    />
                    Match Date & Time:
                    <input 
                        ref={matchDateTimeRef}
                        type="datetime-local" 
                        value={matchDateTime} 
                        onChange={(e) => setMatchDateTime(e.target.value)} 
                        style={{ cursor: 'pointer', padding: '4px 8px' }}
                        required 
                    />
                </label>
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
                    <p>Winner: {result.result?.winner?.username} | MMR: {result.result?.winner?.mmrChange?.after} (+{result.result?.winner?.mmrChange?.change})</p>
                    <p>Loser: {result.result?.loser?.username} | MMR: {result.result?.loser?.mmrChange?.after} ({result.result?.loser?.mmrChange?.change})</p>
                </div>
            )}

            {message && <p>{message}</p>}
        </div>
    );
}
