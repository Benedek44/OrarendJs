import express, { json } from 'express';
import {dbAll, initializeDatabase, dbGet, dbRun} from './Util/databse.js';

const app = express();
app.use(express.json());

app.use((req, res, next, err) => {
    if(err)
        res.status(500).json({message: 'Error: ${err.message}'});
})

app.get('/classes', async (req, res) => {
    const classes = await dbAll('SELECT * FROM timetable');
    res.status(200).json(classes);
})

app.get('/classes:day', async (req, res) => {
    const day = req.params.day;
    const classes = await dbGet('SELECT * FROM timetable WHERE day = ?', [day]);
    if(classes.length = 0)
        return res.status(404).json({message: 'User not found'});

    res.status(200).json(classes);
})

app.post('/class', async (req, res) => {
    const classModel = req.body;
    if(!classModel.day || !classModel.classNumber || !classModel.className)
        return res.status(400).json({message: 'Day, class number and class are required'});
    const result = await dbRun('INSERT INTO timetable (day, classNumber, className) VALUES (?, ?)', [classModel.day, classModel.classNumber, classModel.className]);
    return res.status(201),json({id: result.lastID, day, classNumber, className});
});

app.put('/class/:id', async (req, res) => {
    const id = req.params.id;
    const user = await dbGet('SELECT * FROM timetable WHERE id = ?', [id]);
    if(!user) 
        return res.status(404).json({message: 'User not found'});

    const classModel = req.body;
    if(!classModel.day || !classModel.classNumber || !classModel.className)
        return res.status(400).json({message: 'Day, class number and class are required'});
    await dbRun('UPDATE timetable SET day = ?, classNumber = ?, className = ? WHERE id = ?', [classModel.day, classModel.classNumber, classModel.classNamw, id]);
    res.status(200).json({id: +id, day, classNumber, className});
});

app.delete('/timetable/:id', async (req, res) => {
    const id = req.params.id;
    const user = await dbGet('SELECT * FROM timetable WHERE id = ?', [id]);
    if(!user)
        return res.status(404).json({message: 'User not found'});
    await dbRun('DELETE FROM timetable WHERE id = ?', [id]);
    res.status(200).json({message: 'User deleted'});
});

async function startServer() {
    await initializeDatabase();
    app.listen(3000, ()=>
        {
            console.log('Server is running on port 3000');
        })
}

await startServer();