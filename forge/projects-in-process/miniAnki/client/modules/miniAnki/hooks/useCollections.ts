import { useEffect, useState } from 'react';
import storage from '../storages/wordsStorage';

import type { Collection } from '../types/types'

export function useCollections() {
    const [collections, setCollections] = useState<Collection[]>([]);

    useEffect(() => {
        storage.loadCollections().then(setCollections);
    }, []);

    const create = async (title: string) => {
        await storage.createCollection(title);
        setCollections(await storage.loadCollections());
    };

    const addWord = async (
        collectionId: string, front: string, back: string
    ): Promise<boolean> => {
        const collection = collections.find(c => c.id === collectionId);
        if (!collection) return false;

        const exists = collection.words.some(
            w => w.front.trim() === front.trim() && w.back.trim() === back.trim()
        );
        if (exists) return false;

        const word = {
            id: `${Date.now().toString()}-${(Math.random()*1000).toFixed()}`,
            front,
            back,
        };
        await storage.addWordToCollection(collectionId, word);
        const wordReverse = {
            id: `${Date.now().toString()}-${(Math.random()*1000).toFixed()}`,
            front: back,
            back: front,
        };
        await storage.addWordToCollection(collectionId, wordReverse);
        setCollections(await storage.loadCollections());
        return true;
    };

    const reload = async () => {
        setCollections(await storage.loadCollections());
    };

    const deleteCollection = async (id: string) => {
        await storage.deleteCollection(id);
        setCollections(await storage.loadCollections());
    };

    const renameCollection = async (id: string, newTitle: string) => {
        await storage.renameCollection(id, newTitle);
        setCollections(await storage.loadCollections());
    };

    const updateWord = async (
        collectionId: string, wordId: string, front: string, back: string
    ): Promise<boolean> => {
        const collection = collections.find(c => c.id === collectionId);
        if (!collection) return false;

        // Check for duplicates (excluding the word being edited and its reverse pair)
        const word = collection.words.find(w => w.id === wordId);
        if (!word) return false;

        const oldFront = word.front;
        const oldBack = word.back;

        const exists = collection.words.some(
            w => w.id !== wordId &&
                // Not the reverse pair of the word being edited
                !(w.front === oldBack && w.back === oldFront) &&
                // Check if new values conflict with existing words
                w.front.trim() === front.trim() && w.back.trim() === back.trim()
        );
        if (exists) return false;

        await storage.updateWordInCollection(collectionId, wordId, front, back);
        setCollections(await storage.loadCollections());
        return true;
    };

    const deleteWord = async (collectionId: string, wordId: string) => {
        await storage.removeWordFromCollection(collectionId, wordId);
        setCollections(await storage.loadCollections());
    };


    return { collections, create, addWord, updateWord, reload, deleteCollection, renameCollection, deleteWord };
}
