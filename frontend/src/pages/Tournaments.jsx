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
        <div>hello</div>
    )
}
