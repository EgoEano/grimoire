import type { Collection, Word } from '../types/types';
import storage from '../../../core/services/storage/storageService';

const KEY = 'collections';

async function loadCollections(): Promise<Collection[]> {
    return (await storage.get(KEY)) || [];
}

async function saveCollections(list: Collection[]) {
    return storage.set(KEY, list);
}

async function createCollection(title: string): Promise<Collection> {
    const list = (await loadCollections()) || [];

    const newCol: Collection = {
        id: Date.now().toString(),
        title,
        words: [],
    };

    list.push(newCol);
    await saveCollections(list);
    return newCol;
}

async function addWordToCollection(collectionId: string, word: Word) {
    const list = await loadCollections();
    const col = list.find(c => c.id === collectionId);
    if (!col) return;

    const exists = col.words.some(
        w => w.front === word.front && w.back === word.back
    );

    if (!exists) col.words.push(word);
    await saveCollections(list);
}

async function removeWordFromCollection(collectionId: string, wordId: string) {
    const list = await loadCollections();
    const col = list.find(c => c.id === collectionId);
    if (!col) return;

    col.words = col.words.filter(w => w.id !== wordId);
    await saveCollections(list);
}

async function updateWordInCollection(collectionId: string, wordId: string, front: string, back: string) {
    const list = await loadCollections();
    const col = list.find(c => c.id === collectionId);
    if (!col) return;

    // Find the word to update
    const word = col.words.find(w => w.id === wordId);
    if (!word) return;

    // Store the old values to find the reverse pair
    const oldFront = word.front;
    const oldBack = word.back;

    // Update the word
    word.front = front;
    word.back = back;

    // Find and update the reverse pair (front and back are swapped)
    const reversePair = col.words.find(
        w => w.id !== wordId && w.front === oldBack && w.back === oldFront
    );
    if (reversePair) {
        reversePair.front = back;
        reversePair.back = front;
    }

    await saveCollections(list);
}


async function getCollection(id: string): Promise<Collection | null> {
    const list = await loadCollections();
    return list.find(c => c.id === id) || null;
}

async function deleteCollection(id: string) {
    const list = await loadCollections();
    const newList = list.filter(c => c.id !== id);
    await saveCollections(newList);
}

async function renameCollection(id: string, newTitle: string) {
    const list = await loadCollections();
    const col = list.find(c => c.id === id);
    if (!col) return;
    
    col.title = newTitle;
    await saveCollections(list);
}

export default {
    loadCollections,
    saveCollections,
    createCollection,
    addWordToCollection,
    removeWordFromCollection,
    updateWordInCollection,
    getCollection,
    deleteCollection,
    renameCollection,
};
