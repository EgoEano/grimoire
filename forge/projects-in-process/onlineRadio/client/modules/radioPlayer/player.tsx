import React, { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList } from 'react-native';
import { AudioWebModule } from './audioModule';
import { Button, Modal, ModalCard } from '@client/core/ui/components/interfaceComponents';
import Slider from '@react-native-community/slider';
import storage from '../../core/services/storage/storageService.web'
import { useNotification } from '@client/core/services/providers/notificationProvider';


type RadioICYHeaders = {
    icyName: string;
    icyGenre: string;
    icyDescription: string;
};

type RadioEntity = {
    id: string;
    name: string;
    url: string;
};

type NewFavoriteModalProps = {
    isShow: boolean;
    setIsShow: Dispatch<SetStateAction<boolean>>;
    url: string;
    addFavorite: (name?: string) => void;
};



const COLOR_BG = "#0A0A0A";
const COLOR_CARD = "#111111";
const COLOR_TEXT = "#EEEEEE";
const COLOR_GOLD = "#D4AF37";
const RADIO_STORAGE_KEY = "online_radio_favorites";

const styleRadio = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: COLOR_BG,
        paddingBottom: 24, 
        paddingTop: 10,
        paddingHorizontal: 10,
        gap: 24,
    },
    topBlock: {width: '100%'},
    midBlock: {
        flex: 1, 
        width: '100%', 
        justifyContent: 'flex-start'
    },
    bottomBlock: {width: '100%'},
    inputArea: {
        width: '100%',
        flexDirection: 'row',
        marginBottom: 8,
    },
    title: {
        color: COLOR_GOLD,
        fontSize: 26,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 10,
    },
    textInput: {
        flex: 1,
        backgroundColor: '#0C0C0C',
        color: COLOR_TEXT,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: COLOR_GOLD,
        borderRadius: 10,
        fontSize: 15,
    },
    buttonPrimary: {
        width: '100%',
        paddingVertical: 14,
        backgroundColor: '#0F0F0F',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLOR_GOLD,
        alignItems: 'center',
        shadowColor: "#D4AF37",
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 }

    },
    buttonPrimaryText: {
        color: COLOR_GOLD,
        fontSize: 17,
        fontWeight: '600',
    },
    favButtonText: {
        color: COLOR_GOLD,
        fontSize: 22,
    },
    favoriteItem: {
        width: '100%',
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginVertical: 4,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLOR_GOLD,
        backgroundColor: COLOR_CARD,
    },
    favoriteText: {
        color: COLOR_GOLD,
        fontSize: 14,
    },
    metaDataBlock: {
        width: '100%',
        padding: 14,
        backgroundColor: COLOR_CARD,
        color: COLOR_TEXT,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#222",
        shadowColor: "#D4AF37",
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 }
    },
    metaText: {
        color: COLOR_TEXT,
        marginBottom: 4,
        fontSize: 14,
    },
    favButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "#151515",     // графит
        borderWidth: 1,
        borderColor: "#D4AF37",         // золото
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 8,
        shadowColor: "#D4AF37",
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 }
    },
    favIcon: {
        fontSize: 22,
        color: "#D4AF37",
    },
    modalCardInner: {
        padding: 24,
        backgroundColor: COLOR_CARD,
        borderRadius: 12,
        //width: '100%',
        minWidth: 250,

    },
    modalTitle: {
        fontSize: 18,
        color: COLOR_GOLD,
        marginBottom: 14,
    },
    modalTextInput: {
        borderWidth: 1,
        borderColor: COLOR_GOLD,
        borderRadius: 8,
        backgroundColor: "#1a1a1a",
        color: COLOR_TEXT,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 18,
    },
    modalButtonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    modalSaveButton: {
        flex: 1,
        backgroundColor: COLOR_GOLD,
    },
    modalSaveButtonText: {
        color: COLOR_BG,
        fontWeight: "700",
    },
    modalCancelButton: {
        flex: 1,
        backgroundColor: "#363636",
    },
    modalCancelButtonText: {
        color: COLOR_TEXT,
    },
});

const favListStyles = StyleSheet.create({
    listContainer: {
        width: "100%",
        marginTop: 20,
    },

    item: {
        backgroundColor: "#111",
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginVertical: 6,
        borderWidth: 1,
        borderColor: "#D4AF37",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        userSelect: 'none',
        shadowColor: "#D4AF37",
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 }
    },

    itemStar: {
        color: "#D4AF37",
        fontSize: 18,
        marginRight: 10,
    },

    itemText: {
        color: "#f5f3e8",
        fontSize: 14,
        flexShrink: 1,
    }
});

const stylesSlider = StyleSheet.create({
    container: {
        width: "100%",
        paddingVertical: 3,
        paddingHorizontal: 14,
        backgroundColor: "#0f0f0f",        // матовый чёрный
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#2a2a2a",
        shadowColor: "#D4AF37",             // лёгкое золото
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        marginTop: 20,
    },
    label: {
        color: "#E6DFAF",                   // мягкое золото
        marginBottom: 10,
        fontSize: 14,
        textAlign: "center",
        letterSpacing: 0.5,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    minimumTrackTintColor: { color: "#D4AF37" },
    maximumTrackTintColor: { color: "#555" },
    thumbTintColor: { color: "#D4AF37" },
});

export function RadioPlayer() {
    const { pushDialog, pushNotify } = useNotification();

    const [isShowSavingModal, setIsShowSavingModal] = useState(false);

    const [url, setUrl] = useState('');
    const [meta, setMeta] = useState<RadioICYHeaders | null>(null);
    const [favorites, setFavorites] = useState<RadioEntity[]>([]);
    
    const [play, setPlay] = useState(false);
    const [volume, setVolume] = useState(1);

    const handlePlay = (v?: boolean) => setPlay(t => v ?? !t);

    const handleTexting = (txt: string) => {
        setUrl(txt);
        setPlay(false);
    };

    const showFavModal = () => {
        if (!url) return;
        if (!url || favorites.some(el => el.url === url)) {
            pushNotify({
                message: 'Already in favorites',
                type: 'info',
                timeout: 3
            })
            return;
        };
        setIsShowSavingModal(true);
    };

    const addFavorite = (name?: string) => {
        const item: RadioEntity = {
            id: String(Date.now()),
            url,
            name: String(name || meta?.icyName || url)
                .replace('http://', '')
                .replace('https://', '')
        };

        setFavorites(prev => {
            const newState = [...prev, item];
            storage.set(RADIO_STORAGE_KEY, newState);
            return newState;
        });
    };

    const removeFavorite = async (id: string) => {
        const ent = favorites.find(el => el.id === id);

        if (!ent) return;

        const isDel = await pushDialog({
            message: `Delete ${ent.name} permanently?`,
            type: 'confirm',
        })

        if (!isDel) return;

        setFavorites(prev => {
            const newState = favorites.filter(el => el.id !== id);
            storage.set(RADIO_STORAGE_KEY, newState);
            return newState;
        });
    };

    const selectFavorite = (favUrl: string) => {
        setUrl(favUrl);
        if (!play) setPlay(true);
    };

    const fetchICYMeta = async () => {
        setMeta(null);
        if (!url) return;

        try {
            const res = await fetch(url, { method: 'HEAD' });
            setMeta({
                icyName: res.headers.get('icy-name') ?? '',
                icyGenre: res.headers.get('icy-genre') ?? '',
                icyDescription: res.headers.get('icy-description') ?? '',
            });
        } catch (err) {
            console.warn('ICY fetch error - ', err);
        }
    };

    useEffect(() => {
        fetchICYMeta();
    }, [url]);

    useEffect(() => {
        storage.get(RADIO_STORAGE_KEY)
            .then(data => setFavorites(data ?? []));

        document.title = 'JRP';
    }, []);
    
    return (
        <>
        <View style={styleRadio.container}>
            {/* Верхний блок */}
            <View style={styleRadio.topBlock}>
                <Text style={styleRadio.title}>
                    Just Radio Player
                </Text>
                <View style={styleRadio.inputArea}>
                    <TextInput
                        placeholder="Enter stream URL"
                        value={url}
                        onChangeText={handleTexting}
                        style={styleRadio.textInput}
                    />
                    <Button
                        onPress={showFavModal}
                        style={{
                            button: styleRadio.favButton
                        }}
                    >
                        <Text style={styleRadio.favIcon}>{"★"}</Text>
                    </Button>
                </View>
            </View>

            <View style={styleRadio.midBlock}>
                <AudioWebModule
                    src={url}
                    playing={play}
                    volume={volume}
                />
                <RadioMetaBlock meta={meta}/>
                <FlatList
                    data={favorites}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={item => item.name}
                    style={favListStyles.listContainer}
                    renderItem={({ item }) => (
                        <Button
                            onPress={() => selectFavorite(item.url)}
                            onLongPress={() => removeFavorite(item.id)}
                            style={{
                                button: favListStyles.item
                            }}
                        >
                            <Text style={favListStyles.itemStar}>★</Text>
                            <Text style={favListStyles.itemText}>{item.name}</Text>
                        </Button>
                    )}
                />
            </View>

            {/* Нижний блок */}
            <View style={styleRadio.bottomBlock}>
                <View style={stylesSlider.container}>
                    <Slider
                        style={stylesSlider.slider}
                        minimumValue={0}
                        maximumValue={1}
                        step={0.01}
                        value={volume}
                        onValueChange={(v: number) => setVolume(v)}
                        minimumTrackTintColor={stylesSlider.minimumTrackTintColor.color}
                        maximumTrackTintColor={stylesSlider.maximumTrackTintColor.color}
                        thumbTintColor={stylesSlider.thumbTintColor.color}
                    />
                </View>
                <Button
                    onPress={() => handlePlay()}
                    style={{ button: styleRadio.buttonPrimary }}>
                    <Text style={styleRadio.buttonPrimaryText}>{play ? "Stop" : "Play"}</Text>
                </Button>
            </View>
        </View>
        <NewFavoriteModal
            isShow={isShowSavingModal}
            setIsShow={setIsShowSavingModal}
            url={meta?.icyName || url}
            addFavorite={addFavorite}
        />
        </>
    );
}

function RadioMetaBlock({meta}: {meta: RadioICYHeaders | null}) {
    if (!meta?.icyName && !meta?.icyGenre && !meta?.icyDescription) return null;
    return (
        <View style={styleRadio.metaDataBlock}>
            <Text style={styleRadio.metaText}>{meta.icyName && `Station: ${meta.icyName}`}</Text>
            <Text style={styleRadio.metaText}>{meta.icyGenre && `Genre: ${meta.icyGenre}`}</Text>
            <Text style={styleRadio.metaText}>{meta.icyDescription && `Description: ${meta.icyDescription}`}</Text>
        </View>
    );
}

function NewFavoriteModal({
    isShow,
    setIsShow,
    url,
    addFavorite
}: NewFavoriteModalProps) {
    const [name, setName] = useState<string>(url);
    
    useEffect(() => {
        setName(url);
    }, [url]);

    return (
        <ModalCard 
            isShow={isShow} 
            setIsShow={setIsShow}
            isHasCross={false}
            style={{
                card: styleRadio.modalCardInner
            }}
        >
            <Text style={styleRadio.modalTitle}>Save Radio Station</Text>
            <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Name of the station"
                placeholderTextColor="#888"
                style={styleRadio.modalTextInput}
            />
            <View style={styleRadio.modalButtonRow}>
                <Button
                    onPress={() => {
                        addFavorite(name);
                        setIsShow(false);
                    }}
                    style={{ button: styleRadio.modalSaveButton }}
                >
                    <Text style={styleRadio.modalSaveButtonText}>Save</Text>
                </Button>
                <Button
                    onPress={() => setIsShow(false)}
                    style={{ button: styleRadio.modalCancelButton }}
                >
                    <Text style={styleRadio.modalCancelButtonText}>Cancel</Text>
                </Button>
            </View>
        </ModalCard>
    )
}