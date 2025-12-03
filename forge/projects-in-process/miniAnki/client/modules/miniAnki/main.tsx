import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, Animated } from 'react-native';
import { Text, View, ModalCard, InputText, Button, FormContent } from '@client/core/ui/components/interfaceComponents';

import { useCollections } from './hooks/useCollections';
import statsStorage from './storages/statsStorage';
import type { Collection, Word } from './types/types';
import { useNotification } from '@client/core/services/providers/notificationProvider';
import { useGameSession } from './hooks/useGameSession';
import styles from './styles/style';
import { useStyleContext } from '@client/core/services/providers/styleProvider';

export function MainScreen() {
    const { collections, create, addWord, updateWord, deleteCollection, renameCollection, deleteWord } = useCollections();
    const {createTheme} = useStyleContext();

    const [isGame, setIsGame] = useState<boolean>(false);
    const [collectionID, setCollectionID] = useState<string | null>(null);
    const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

    const selectGame = (id: string) => {
        setCollectionID(id);
        setIsGame(true);
    };

    const exitGame = () => {
        setCollectionID(null);
        setIsGame(false);
    };

    useEffect(() => {
        if (!collectionID) setSelectedCollection(null);
        const curr = collections.find(c => c.id === collectionID) ?? null;
        setSelectedCollection(curr)
    }, [collectionID, collections]);

    useEffect(() => {
        document.title = "miniAnki";
        createTheme();
    }, []);

    return (
        isGame ?
            <GameScreen
                collection={selectedCollection}
                onBack={exitGame}
            /> :
            <CollectionsScreen
                selectGame={selectGame}
                exitGame={exitGame}
                collections={collections}
                createCollection={create}
                addWord={addWord}
                updateWord={updateWord}
                deleteCollection={deleteCollection}
                renameCollection={renameCollection}
                deleteWord={deleteWord}
            />
    );
}

export default function CollectionsScreen({
    collections,
    selectGame,
    exitGame,
    createCollection,
    addWord,
    updateWord,
    deleteCollection,
    renameCollection,
    deleteWord,
}: {
    collections: Collection[];
    selectGame: (id: string) => void;
    exitGame: () => void;
    createCollection: (title: string) => void;
    addWord: (collectionId: string, front: string, back: string) => Promise<boolean>;
    updateWord: (collectionId: string, wordId: string, front: string, back: string) => Promise<boolean>;
    deleteCollection: (id: string) => void;
    renameCollection: (id: string, newTitle: string) => void;
    deleteWord: (collectionId: string, wordId: string) => void;
}) {
    const { pushNotify } = useNotification();
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [contextMenuVisible, setContextMenuVisible] = useState(false);
    const [isAddCardVisible, setIsAddCardVisible] = useState(false);
    const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
    const [viewMode, setViewMode] = useState<'collections' | 'words'>('collections');
    const [dialogVisible, setDialogVisible] = useState(false);

    const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);


    const [dialogMessage, setDialogMessage] = useState('');
    const [dialogOnConfirm, setDialogOnConfirm] = useState<(() => void) | null>(null);

    const pushDialog = (message: string, onConfirm: () => void) => {
        setDialogMessage(message);
        setDialogOnConfirm(() => onConfirm);
        setDialogVisible(true);
    };

    const handleConfirmDialog = () => {
        if (dialogOnConfirm) {
            dialogOnConfirm();
        }
        setDialogVisible(false);
        setDialogOnConfirm(null);
    };

    const handleCreateCollection = ({ data, validation }: { data: Record<string, any>; validation: { success: boolean; errors: string[] } }) => {
        if (validation.success && data.title?.trim()) {
            createCollection(data.title);
            setIsCreateModalVisible(false);
        }
    };

    const handleLongPress = (id: string) => {
        setSelectedCollectionId(id);
        setContextMenuVisible(true);
    };

    const handleAddCard = async ({ data, validation }: { data: Record<string, any>; validation: { success: boolean; errors: string[] } }) => {
        if (!selectedCollectionId) return;
        
        if (validation.success && data.front?.trim() && data.back?.trim()) {
            const ok = await addWord(selectedCollectionId, data.front, data.back);
            if (!ok) {
                pushNotify({
                    message: "Word is already exists",
                    type: "error",
                    timeout: 2,
                });
                return;
            }

            setIsAddCardVisible(true);
            pushNotify({
                message: "Card added successfully",
                type: "success",
                timeout: 2,
            });
        }
    };

    const handleDeleteCollection = () => {
        if (selectedCollectionId) {
            setContextMenuVisible(false);
            pushDialog("Are you sure you want to delete this collection?", () => {
                deleteCollection(selectedCollectionId);
                setSelectedCollectionId(null);
            });
        }
    };

    const openAddCard = () => {
        setContextMenuVisible(false);
        setIsAddCardVisible(true);
    };

    const openViewWords = () => {
        setContextMenuVisible(false);
        setViewMode('words');
    };

    const openRenameCollection = () => {
        setContextMenuVisible(false);
        setIsRenameModalVisible(true);
    };

    const handleRenameCollection = ({ data, validation }: { data: Record<string, any>; validation: { success: boolean; errors: string[] } }) => {
        if (!selectedCollectionId) return;
        
        if (validation.success && data.title?.trim()) {
            renameCollection(selectedCollectionId, data.title);
            setIsRenameModalVisible(false);
            setSelectedCollectionId(null);
            pushNotify({
                message: "Collection renamed successfully",
                type: "success",
                timeout: 2,
            });
        }
    };

    const handleSelectCollection = (collection: Collection) => {
        if (collection.words.length === 0) {
            pushDialog("This collection is empty. Add some words first?", () => {
                setSelectedCollectionId(collection.id);
                openAddCard();
            });
        } else {
            selectGame(collection.id);
        }
    };

    if (viewMode === 'words' && selectedCollectionId) {
        const collection = collections.find(c => c.id === selectedCollectionId);
        return (
            <WordsListScreen
                collection={collection || null}
                collectionId={selectedCollectionId}
                onBack={() => setViewMode('collections')}
                updateWord={updateWord}
                deleteWord={deleteWord}
            />
        );
    }

    return (
        <>
            <View style={styles.container}>
                <Text colorVariant={'secondary'} variant={'title'} style={styles.title}>
                    Collections
                </Text>

                <FlatList
                    data={collections}
                    keyExtractor={(i) => i.id}
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <CollectionListItem
                            item={item}
                            handleSelectCollection={handleSelectCollection}
                            handleLongPress={handleLongPress}
                        />
                    )}
                />

                <Button
                    onPress={() => setIsCreateModalVisible(true)}
                    variant={'secondary'}
                    title={'+ New Collection'}
                    style={{
                        button: styles.newCollectionButton,
                        text: styles.newCollectionButtonText
                    }}>
                </Button>

            </View>
            {/* Create Collection Modal */}
            <ModalCard
                isShow={isCreateModalVisible}
                setIsShow={setIsCreateModalVisible}
                style={{
                    content: styles.modalView
                }}
            >
                <Text
                    colorVariant={'secondary'}
                    variant={'subtitle'}
                >
                    New Collection
                </Text>
                <FormContent
                    formData={{ title: '' }}
                    formDataRules={{
                        title: (value: string) => value?.trim().length > 0
                    }}
                    onSubmit={handleCreateCollection}
                >
                    {({ values, handleChange, handleSubmit }) => (
                        <>
                            <InputText
                                value={values.title || ''}
                                onChange={(val) => handleChange(val, 'title')}
                                placeholder="Collection Title"
                                variant={'secondary'}
                                style={{
                                    container: styles.input
                                }}
                            />
                            <Button
                                title="Create"
                                onPress={handleSubmit}
                                style={{ button: styles.buttonMaxWidth }}
                            />
                        </>
                    )}
                </FormContent>
            </ModalCard>

            {/* Context Menu Modal */}
            <ModalCard
                isShow={contextMenuVisible}
                setIsShow={setContextMenuVisible}
                isHasCross={false}
                style={{
                    content: styles.contextMenuView
                }}
            >
                <Text variant={'subtitle'} colorVariant={'secondary'} style={styles.contextMenuTitle}>Options</Text>
                <Button
                    title="Add Word"
                    variant={'primary'}
                    onPress={openAddCard}
                    style={{ button: styles.buttonMaxWidth }}
                />
                <Button
                    title="View Words"
                    variant={'primary'}
                    onPress={openViewWords}
                    style={{ button: styles.buttonMaxWidth }}
                />
                <Button
                    title="Rename Collection"
                    variant={'primary'}
                    onPress={openRenameCollection}
                    style={{ button: styles.buttonMaxWidth }}
                />
                <Button
                    title="Delete Collection"
                    variant={'error'}
                    onPress={handleDeleteCollection}
                    style={{ button: styles.buttonMaxWidth }}
                />
            </ModalCard>

            {/* Add Card Modal */}
            <ModalCard
                isShow={isAddCardVisible}
                setIsShow={setIsAddCardVisible}
                style={{
                    content: styles.modalView
                }}
            >
                <Text variant={'subtitle'} colorVariant={'secondary'} >Add New Word</Text>
                <FormContent
                    formData={{ front: '', back: '' }}
                    formDataRules={{
                        front: (value: string) => value?.trim().length > 0,
                        back: (value: string) => value?.trim().length > 0
                    }}
                    onSubmit={handleAddCard}
                >
                    {({ values, handleChange, handleSubmit }) => (
                        <>
                            <InputText
                                value={values.front || ''}
                                onChange={(val) => handleChange(val, 'front')}
                                placeholder="Front (Question)"
                                variant={'secondary'}
                                style={{
                                    container: styles.addCardInput
                                }}
                            />
                            <InputText
                                value={values.back || ''}
                                onChange={(val) => handleChange(val, 'back')}
                                placeholder="Back (Answer)"
                                variant={'secondary'}
                                style={{
                                    container: styles.addCardInput
                                }}
                            />
                            <Button
                                title="Add Word"
                                onPress={handleSubmit}
                                style={{ button: styles.buttonMaxWidth }}
                            />
                        </>
                    )}
                </FormContent>
            </ModalCard>

            {/* Rename Collection Modal */}
            <ModalCard
                isShow={isRenameModalVisible}
                setIsShow={setIsRenameModalVisible}
                style={{
                    content: styles.modalView
                }}
            >
                <Text
                    colorVariant={'secondary'}
                    variant={'subtitle'}
                >
                    Rename Collection
                </Text>
                {selectedCollectionId && (() => {
                    const collection = collections.find(c => c.id === selectedCollectionId);
                    return collection ? (
                        <FormContent
                            key={collection.id}
                            formData={{ title: collection.title }}
                            formDataRules={{
                                title: (value: string) => value?.trim().length > 0
                            }}
                            onSubmit={handleRenameCollection}
                        >
                            {({ values, handleChange, handleSubmit }) => (
                                <>
                                    <InputText
                                        value={values.title || ''}
                                        onChange={(val) => handleChange(val, 'title')}
                                        placeholder="Collection Title"
                                        variant={'secondary'}
                                        style={{
                                            container: styles.input
                                        }}
                                    />
                                    <Button
                                        title="Rename"
                                        onPress={handleSubmit}
                                        style={{ button: styles.buttonMaxWidth }}
                                    />
                                </>
                            )}
                        </FormContent>
                    ) : null;
                })()}
            </ModalCard>

            {/* Confirmation Dialog */}
            <ModalCard
                isShow={dialogVisible}
                setIsShow={setDialogVisible}
                isHasCross={false}
                style={{
                    content: styles.modalView
                }}
            >
                <Text colorVariant={'secondary'} style={styles.dialogText}>{dialogMessage}</Text>
                <View style={styles.dialogButtons}>
                    <Button
                        title="Cancel"
                        variant={'primary'}
                        onPress={() => setDialogVisible(false)}
                    />
                    <Button
                        title="Confirm"
                        variant={'error'}
                        onPress={handleConfirmDialog}
                    />
                </View>
            </ModalCard>
        </>
    );
}

function CollectionListItem({
    item,
    handleSelectCollection,
    handleLongPress
}: {
    item: Collection,
    handleSelectCollection: (item: Collection) => void,
    handleLongPress: (id: string) => void
}) {
    return (
        <Button
            onPress={() => handleSelectCollection(item)}
            onLongPress={() => handleLongPress(item.id)}
            style={{
                button: styles.collectionButton
            }}>
            <View style={styles.collectionTextArea}>
                <Text>{item.title}</Text>
                <Text variant={'label'}>
                    {item.words.length} cards
                </Text>
            </View>
            <Button
                onPress={() => handleLongPress(item.id)}
                style={{
                    button: styles.cardContextDots,
                }}
            >
                <Text variant={'subtitle'}>⋮</Text>
            </Button>
        </Button>
    );
}

function WordsListScreen({
    collection,
    collectionId,
    onBack,
    updateWord,
    deleteWord
}: {
    collection: Collection | null;
    collectionId: string;
    onBack: () => void;
    updateWord: (collectionId: string, wordId: string, front: string, back: string) => Promise<boolean>;
    deleteWord: (collectionId: string, wordId: string) => void;
}) {
    const { pushNotify } = useNotification();
    const [isEditCardVisible, setIsEditCardVisible] = useState(false);
    const [selectedWord, setSelectedWord] = useState<Word | null>(null);

    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [wordToDelete, setWordToDelete] = useState<string | null>(null);

    if (!collection) return null;

    const handleEditCard = (word: Word) => {
        setSelectedWord(word);
        setIsEditCardVisible(true);
    };

    const handleSaveEdit = async ({ data, validation }: { data: Record<string, any>; validation: { success: boolean; errors: string[] } }) => {
        if (!selectedWord) return;
        
        if (validation.success && data.front?.trim() && data.back?.trim()) {
            const ok = await updateWord(collectionId, selectedWord.id, data.front, data.back);
            if (!ok) {
                pushNotify({
                    message: "Word with these values already exists",
                    type: "error",
                    timeout: 2,
                });
                return;
            }

            setSelectedWord(null);
            setIsEditCardVisible(false);
            pushNotify({
                message: "Card updated successfully",
                type: "success",
                timeout: 2,
            });
        }
    };

    const handleLongPress = (wordId: string) => {
        setWordToDelete(wordId);
        setDeleteDialogVisible(true);
    };

    const handleConfirmDelete = () => {
        if (wordToDelete) {
            deleteWord(collectionId, wordToDelete);
            setWordToDelete(null);
            setDeleteDialogVisible(false);
            pushNotify({
                message: "Card deleted successfully",
                type: "success",
                timeout: 2,
            });
        }
    };

    return (
        <>
            <View style={styles.wordsListContainer}>
                <Pressable onPress={onBack} style={styles.backToCollectionsButton}>
                    <Text colorVariant={'secondary'}>← Back to Collections</Text>
                </Pressable>
                <Text variant={'subtitle'} colorVariant={'secondary'}>
                    {collection.title} - Words
                </Text>
                {(collection.words.length > 0) ? <FlatList
                    data={collection.words}
                    keyExtractor={(item) => item.id}
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <WordItem
                            word={item}
                            handleSelectCard={handleEditCard}
                            handleLongPress={handleLongPress}
                        />
                    )}
                /> : <Text colorVariant={'secondary'}>No words in this collection</Text>}
            </View>

            {/* Edit Card Modal */}
            <ModalCard
                isShow={isEditCardVisible}
                setIsShow={setIsEditCardVisible}
                style={{
                    content: styles.modalView
                }}
            >
                <Text colorVariant={'secondary'}>Edit Word</Text>
                {selectedWord && (
                    <FormContent
                        key={selectedWord.id}
                        formData={{ front: selectedWord.front, back: selectedWord.back }}
                        formDataRules={{
                            front: (value: string) => value?.trim().length > 0,
                            back: (value: string) => value?.trim().length > 0
                        }}
                        onSubmit={handleSaveEdit}
                    >
                        {({ values, handleChange, handleSubmit }) => (
                            <>
                                <InputText
                                    value={values.front || ''}
                                    onChange={(val) => handleChange(val, 'front')}
                                    variant={'secondary'}
                                    placeholder="Front (Question)"
                                    style={{
                                        container: styles.addCardInput
                                    }}
                                />
                                <InputText
                                    value={values.back || ''}
                                    onChange={(val) => handleChange(val, 'back')}
                                    placeholder="Back (Answer)"
                                    variant={'secondary'}
                                    style={{
                                        container: styles.addCardInput
                                    }}
                                />
                                <Button
                                    title="Save Changes"
                                    onPress={handleSubmit}
                                    style={{ button: styles.buttonMaxWidth }}
                                />
                            </>
                        )}
                    </FormContent>
                )}
            </ModalCard>

            {/* Delete Confirmation Dialog */}
            <ModalCard
                isShow={deleteDialogVisible}
                setIsShow={setDeleteDialogVisible}
                isHasCross={false}
                style={{
                    modal: styles.modalFullWidth,
                    content: styles.modalView
                }}
            >
                <Text colorVariant={'secondary'}  style={styles.dialogText}>Are you sure you want to delete this card?</Text>
                <View style={styles.dialogButtons}>
                    <Button
                        title="Cancel"
                        variant={'primary'}
                        onPress={() => setDeleteDialogVisible(false)}
                    />
                    <Button
                        title="Delete"
                        variant={'error'}
                        onPress={handleConfirmDelete}
                    />
                </View>
            </ModalCard>
        </>
    );
}

function WordItem({
    word, handleSelectCard, handleLongPress
}: {
    word: Word,
    handleSelectCard: (item: Word) => void,
    handleLongPress: (id: string) => void
}) {
    return (
        <Button
            onPress={() => handleSelectCard(word)}
            variant={'primary'}
            onLongPress={() => handleLongPress(word.id)}
            style={{
                button: styles.wordItem
            }}
        >
            <View style={styles.wordItemView}>
                <Text>{word.front}</Text>
                <Text>-</Text>
                <Text>{word.back}</Text>
            </View>
            <Button
                onPress={() => handleLongPress(word.id)}
                style={{
                    button: styles.cardContextDots,
                }}
            >
                <Text variant={'subtitle'}>⋮</Text>
            </Button>
        </Button>
    );
}

export function GameScreen({
    collection, onBack
}: {
    collection: Collection | null, onBack: () => void
}) {
    if (!collection) return null;
    const {
        word,
        stat,
        index,
        total,
        markSuccess: onSuccess,
        markFail: onFail
    } = useGameSession(collection);

    const level = stat?.level ?? 0;
    const intervalPlus = statsStorage.calculateNextTimestamp(level + 1);

    return (
        <View style={styles.gameContainer}>
            <Pressable onPress={onBack} style={styles.backButton}>
                <Text colorVariant={'secondary'}>← Back</Text>
            </Pressable>

            {word ?
                <>
                    <FlipCard front={word.front} back={word.back} />

                    <View style={styles.gameActionRow}>
                        <Button
                            onPress={() => onFail(word)}
                            title="Don't know"
                            style={{
                                text: styles.failButtonText
                            }}
                        />
                        <Button
                            onPress={() => onSuccess(word)}
                            title={`Know (${intervalPlus.name})`}
                            style={{
                                text: styles.successButtonText
                            }}
                        />
                    </View>
                </> :
                <View style={styles.gameEndView}>
                    <Text 
                        variant={'subtitle'}
                        colorVariant={'secondary'}
                        style={styles.gameEndText}
                    >
                        {"Congratulations, you have reviewed all cards! Take a break and come back tomorrow, or practice some more."}
                    </Text>
                </View>
            }
        </View>
    );
}

export function FlipCard({
    front, back
}: { front: string, back: string }) {
    const rotate = useRef(new Animated.Value(0)).current;
    const [flipped, setFlipped] = useState(false);

    const flip = () => {
        Animated.spring(rotate, {
            toValue: flipped ? 0 : 180,
            useNativeDriver: true,
        }).start(() => setFlipped(!flipped));
    };

    const frontInterpolate = rotate.interpolate({
        inputRange: [0, 180],
        outputRange: ['0deg', '180deg'],
    });

    const backInterpolate = rotate.interpolate({
        inputRange: [0, 180],
        outputRange: ['180deg', '360deg'],
    });

    return (
        <Pressable onPress={flip} style={styles.flipCardPressable}>
            <Animated.View
                style={[
                    styles.flipCardFront,
                    { transform: [{ rotateY: frontInterpolate }] }
                ]}>
                <Text variant={'subtitle'}>{front}</Text>
            </Animated.View>

            <Animated.View
                style={[
                    styles.flipCardBack,
                    { transform: [{ rotateY: backInterpolate }] }
                ]}>
                <Text variant={'subtitle'}>{back}</Text>
            </Animated.View>
        </Pressable>
    );
}
