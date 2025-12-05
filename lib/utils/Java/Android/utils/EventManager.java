package com.eande.notestodo.utils;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;

import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.google.gson.Gson;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Consumer;


/*
    For creating event listener:
        //Make manager's exemplair
        EventManager em = new EventManager(this);
        // Register event with name, Type of data, and custom lambda with inputing data type
        em.registerEvent("EntryUpdated", String.class, (data) -> {
            Log.i("test", "broadcast! - " + data);
        });

    For create an event:
        //Make manager's exemplair
        EventManager em = new EventManager(this);
        //Send an event with your data
        this.eventManager.sendEvent("EntryUpdated", name);

 */
public class EventManager {
    private final Context context;
    private final LocalBroadcastManager broadcastManager;
    private final Map<String, Consumer<Object>> eventHandlers = new HashMap<>();
    private final Map<String, BroadcastReceiver> receivers = new HashMap<>();


    public EventManager(Context context) {
        this.context = context.getApplicationContext();
        this.broadcastManager = LocalBroadcastManager.getInstance(context);
    }

    public <T> void registerEvent(String tag, Class<T> dataType, Consumer<T> handler) {
        eventHandlers.put(tag, (Object data) -> handler.accept(dataType.cast(data)));
        BroadcastReceiver receiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                String jsonData = intent.getStringExtra("data");
                if (jsonData != null) {
                    T data = new Gson().fromJson(jsonData, dataType);
                    eventHandlers.get(tag).accept(data);
                }
            }
        };
        broadcastManager.registerReceiver(receiver, new IntentFilter(tag));
        receivers.put(tag, receiver);
    }

    public void unregisterEvent(String tag) {
        BroadcastReceiver receiver = receivers.remove(tag);
        if (receiver != null) {
            broadcastManager.unregisterReceiver(receiver);
        }
    }

    public void sendEvent(String tag, Object data) {
        Intent intent = new Intent(tag);
        String jsonData = new Gson().toJson(data);
        intent.putExtra("data", jsonData);
        broadcastManager.sendBroadcast(intent);
    }

}
