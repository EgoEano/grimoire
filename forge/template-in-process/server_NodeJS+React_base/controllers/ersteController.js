import path from 'path';


const items = [];

export const getItems = (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'erste.html'));
    //res.json(items);
};

export const createItem = (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }
    items.push({ id: items.length + 1, name });
    res.status(201).json({ message: 'User created successfully' });
};
