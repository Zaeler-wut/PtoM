import express from 'express';
import { prisma } from './lib/prisma';
import cors from 'cors';
const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// app.get('/', (req, res) => {
//     res.send('Hello from Prisma API!');  
// });

app.post('/api/books', async (req, res) => {
    const {title, author, description, price } = req.body;
    try {
        const book = await prisma.book.create({
            data: {
                title,
                author,
                description,
                price
            },
        });
        res.status(201).json(book)
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the book.' });
    }
});

app.get('/api/books', async (req, res) => {
    try {
        const books = await prisma.book.findMany();
        if (books.length === 0) {
            return res.json([]);
        } else {
            res.json(books);
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching books. '});
    }
});

app.get('/api/books/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const book = await prisma.book.findUnique({
            where: { bookId: id},
        });
        if (book) {
            res.json(book);
        } else {
            res.status(404).json({ error: 'Book not found' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the book' });
    }
});

app.put('/api/books/:id', async (req, res) => {
    const { id } = req.params
    const { title, author, description, price } = req.body;
    try {
        const book = await prisma.book.update({
            where: { bookId: id },
            data: {
                title,
                author,
                description,
                price,
            },
        });
        res.json(book);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occured while updating the book.' });
    }
});

app.delete('/api/books/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.book.delete({
            where: { bookId: id },
        });
        res.status(204).send();
    }
    catch (error: any) {
        if (error.code === 'P2025') {
            res.status(404).json({ error: 'Book not found.' });
        } else {
            console.error(error);
            res.status(500).json({ error: 'An error occured while deleting the book.'})
        }
    }
});

app.listen(port, () => {
    console.log(`Server is running on http:localhost:${port}`);
});