package com.eande.notestodo.utils;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteException;
import android.util.Log;

import androidx.annotation.NonNull;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;

import java.lang.reflect.Field;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DBConnectManager {
    //TODO Есть неполадки с новой пустой таблицей - курсор не приходит пустым, но выдается ошибка
    Context context;
    private static String DATABASE_NAME;
    private static String DATABASE_PATH;
    private static int DATABASE_VERSION = 1;
    private SQLiteDatabase db;

    private static final Map<Class<?>, String> typeMapping = new HashMap<>();
    static {
        typeMapping.put(String.class, "TEXT");
        typeMapping.put(char.class, "TEXT");
        typeMapping.put(Character.class, "TEXT");
        typeMapping.put(int.class, "INTEGER");
        typeMapping.put(Integer.class, "INTEGER");
        typeMapping.put(long.class, "INTEGER");
        typeMapping.put(Long.class, "INTEGER");
        typeMapping.put(short.class, "INTEGER");
        typeMapping.put(Short.class, "INTEGER");
        typeMapping.put(byte.class, "INTEGER");
        typeMapping.put(Byte.class, "INTEGER");
        typeMapping.put(boolean.class, "INTEGER");
        typeMapping.put(Boolean.class, "INTEGER");
        typeMapping.put(double.class, "REAL");
        typeMapping.put(Double.class, "REAL");
        typeMapping.put(float.class, "REAL");
        typeMapping.put(Float.class, "REAL");
        typeMapping.put(byte[].class, "BLOB");
    }

//region DB CRUD
    //U

    public DBConnectManager(@NonNull Context context, String dbName) {
        try {
            if (!this.IsValidName(dbName)) throw new IllegalArgumentException("Invalid database name");
            this.context = context;
            this.DATABASE_NAME = dbName + ".db";
        } catch (Exception e) {
            Log.e("SQLite_ex", e.toString());
        }
    }

    public DBConnectManager(@NonNull Context context, String dbName, String dbPath) {
        try {
            if (!this.IsValidName(dbName)) throw new IllegalArgumentException("Invalid database name");
            this.context = context;
            this.DATABASE_NAME = dbName + ".db";
            this.DATABASE_PATH = dbPath;
        } catch (Exception e) {
            Log.e("SQLite_ex", e.toString());
        }
    }

    public Boolean OpenDB() {
        try {
            if (this.DATABASE_PATH != null) {
                db = SQLiteDatabase.openOrCreateDatabase(DATABASE_PATH + "/" + DATABASE_NAME, null);
            } else {
                db = context.openOrCreateDatabase(this.DATABASE_NAME, Context.MODE_PRIVATE ,null);
            }
            return true;
        } catch (Exception e) {
            Log.e("SQLite_ex", e.toString());
            return false;
        }
    }

    public Boolean CloseDB() {
        if (db != null && db.isOpen()) {
            try {
                db.close();
                db = null;
                return true;
            } catch (Exception e) {
                Log.e("SQLite_ex", e.toString());
                return false;
            }
        }
        return null;
    }

    public void UpdateDB(@NonNull Context context) {
    }

    public boolean DeleteDB(@NonNull Context context) {
        return context.deleteDatabase(DATABASE_NAME);
    }

//endregion

//region TABLE CRUD
//U
    public Boolean CreateTable(@NonNull String tableName) {
        try {
            if (!this.IsValidName(tableName)) throw new IllegalArgumentException("Invalid table name");
            this.OpenDB();

            StringBuilder sb = new StringBuilder();
            sb
                    .append("CREATE TABLE IF NOT EXISTS ")
                    .append(tableName)
                    .append(" ( ")
                    .append("id INTEGER PRIMARY KEY AUTOINCREMENT")
                    .append(", ")
                    .append("name TEXT")
                    .append(");");

            db.execSQL(sb.toString());
            return true;
        } catch (SQLiteException e) {
            Log.e("SQLite_ex", e.toString());
            return false;
        } finally {
            this.CloseDB();
        }
    }

    public Boolean CreateTable(@NonNull Class<?> cls, String tableName) {
        try {
            String query = this.TableEntityCreator(cls, tableName);
            if (query == null) throw new IllegalArgumentException("Invalid query string");
            this.OpenDB();
            db.execSQL(query);
            return true;
        } catch (SQLiteException e) {
            Log.e("SQLite_ex", e.toString());
            return false;
        } finally {
            this.CloseDB();
        }
    }

    public List<Map<String, Object>> GetTable(@NonNull String tableName) {
        List<Map<String, Object>> list = null;
        boolean isCreated = false;
        boolean isExists = this.IsTableExists(tableName);
        if (!isExists) isCreated = this.CreateTable(tableName);

        if (isExists || isCreated) {
            String query = "SELECT * FROM " + tableName;
            list = this.GetRawRows(query, null);
        }
        return list;
    }

    public <T> List<T> GetTable(@NonNull String tableName, @NonNull Class<T> cls) {
        List<T> list = null;
        boolean isCreated = false;
        boolean isExists = this.IsTableExists(tableName);
        if (!isExists) isCreated = this.CreateTable(tableName);

        if (isExists || isCreated) {
            String query = "SELECT * FROM " + tableName;
            List<Map<String, Object>> rows = this.GetRawRows(query, null);
            list = this.ParseMapIntoClass(cls, rows);
        }
        return list;
    }

    public void UpdateTable() {

    }

    public Boolean DeleteTable(@NonNull String tableName) {
        boolean isExists = this.IsTableExists(tableName);
        try {
            if (isExists) {
                String query = "DROP TABLE IF EXISTS " + tableName;
                this.OpenDB();
                db.execSQL(query);
                return true;
            } else {
                return false;
            }
        } catch (SQLiteException e) {
            Log.e("SQLite_ex", e.toString());
            return null;
        } finally {
            this.CloseDB();
        }
    }

//endregion

//region ENTITY CRUD
//U D
    public Long Add(Object cls, @NonNull String tableName) {
        Long result = null;
        boolean isExists = this.IsTableExists(tableName);
        if (isExists) {
            try {
                ContentValues values = this.GetClassValuesMap(cls,tableName);
                this.OpenDB();
                result = db.insert(tableName, null, values);
            } catch (SQLiteException e) {
                Log.e("SQLite_ex", e.toString());
                result = -1L;
            } finally {
                this.CloseDB();
            }
        }
        return result;
    }

    public List<Map<String, Object>> GetByID(@NonNull String tableName, @NonNull int id) {
        List<Map<String, Object>> list = null;
        boolean isCreated = false;
        boolean isExists = this.IsTableExists(tableName);
        if (!isExists) isCreated = this.CreateTable(tableName);

        if (isExists || isCreated) {
            StringBuilder sb = new StringBuilder();
            sb
                    .append("SELECT * FROM ")
                    .append(tableName)
                    .append(" WHERE ID = ?");
            list = this.GetRawRows(sb.toString(), new String[]{String.valueOf(id)});
        }
        return list;
    }

    public void SearchBy() {

    }

    public void Update() {

    }

    public void Delete() {

    }

//endregion


//region PROC CRUD
    public void exec(String q) {
        return;
    }

    public void execProc() {

    }
//endregion

//region UTILS
    private List<Map<String, Object>> GetRawRows(@NonNull String query, String[] params) {
        List<Map<String, Object>> list = new ArrayList<>();
        Cursor cursor = null;
        try {
            this.OpenDB();
            cursor = db.rawQuery(query, params);
            if (cursor != null & cursor.getCount() > 0) {
                list = this.CursorToObjectList(cursor);
            }
        } catch (SQLiteException e) {
            Log.e("SQLite_ex", e.toString());
        } finally {
            if (cursor != null) cursor.close();
            this.CloseDB();
        }
        return list;
    }

    private List<Map<String, Object>> CursorToObjectList(@NonNull Cursor cursor) {
        int colCount = cursor.getColumnCount();
        int rowsCount = cursor.getCount();
        List<Map<String, Object>> list = new ArrayList<>();
        if (rowsCount == 0) return list;

        while (cursor.moveToNext()) {
            Map<String, Object> map = new HashMap<>();
            for (int i=0; i < colCount; i++) {
                String name = cursor.getColumnName(i);
                int type = cursor.getType(i);

                switch (type) {
                    case (Cursor.FIELD_TYPE_NULL):
                        map.put(name, null);
                        break;
                    case (Cursor.FIELD_TYPE_INTEGER):
                        map.put(name, cursor.getInt(i));
                        break;
                    case (Cursor.FIELD_TYPE_FLOAT):
                        map.put(name, cursor.getFloat(i));
                        break;
                    case (Cursor.FIELD_TYPE_STRING):
                        map.put(name, cursor.getString(i));
                        break;
                    case (Cursor.FIELD_TYPE_BLOB):
                        map.put(name, cursor.getBlob(i));
                        break;
                }
            }
            list.add(map);
        }
        return list;
    }

    private boolean IsValidName(@NonNull String name) {
        return name.matches("[a-zA-z0-9_\\-\\.]+");
    }

    private Boolean IsTableExists(@NonNull String tableName) {
        List<Map<String, Object>> result = null;
        Boolean isExists = false;
        try {
            String query = "SELECT name FROM sqlite_master WHERE type='table' AND name=?";
            result = this.GetRawRows(query, new String[]{tableName});

            if (result != null && !result.isEmpty()) {
                isExists = true;
            }
        } catch (SQLiteException e) {
            isExists = null;
        }
        return isExists;
    }

    private String TableEntityCreator(@NonNull Class<?> cls, String tableName) {
        try {
            StringBuilder sb = new StringBuilder();
            String commaSuffix = ", ";
            sb
                    .append("CREATE TABLE IF NOT EXISTS ")
                    .append((tableName != null) ? tableName : cls.getSimpleName())
                    .append(" ( ")
                    .append("id INTEGER PRIMARY KEY AUTOINCREMENT")
                    .append(commaSuffix);

            Field[] fields = cls.getDeclaredFields();
            for (Field field : fields) {
                String name = field.getName();

                if (name.toLowerCase() == "id") continue;

                Class<?> fieldType = field.getType();
                String type = (!List.class.isAssignableFrom(fieldType)) ? typeMapping.get(fieldType) : "TEXT";

                if (name == null || name.length() == 0) throw new IllegalArgumentException("Incorrect name field: " + field.getName());
                if (type == null) throw new IllegalArgumentException("Unsupported field type: " + fieldType.getSimpleName());

                sb.append(name).append(" ").append(type);
                if (fieldType.isPrimitive()) sb.append(" NOT NULL");
                sb.append(commaSuffix);
            }

            if (sb.substring(sb.length() - commaSuffix.length()).equals(commaSuffix)) {
                sb.delete(sb.length() - commaSuffix.length(), sb.length());
            }
            sb.append(");");
            return sb.toString();
        } catch (Exception e) {
            Log.e("SQLite_ex", e.toString());
            return null;
        }
    }

    public List<Map<String, Object>> GetTableInfo(@NonNull String tableName) {
        String query = "PRAGMA table_info(" + tableName + ")";
        return this.GetRawRows(query, null);
    }

    public ContentValues GetClassValuesMap(Object cls, @NonNull String tableName) {
        List<Map<String, Object>> prop = this.GetTableInfo(tableName);
        if (prop == null || prop.size() == 0) throw new IllegalArgumentException("Table info problem");

        Class<?> classObj = cls.getClass();
        ContentValues cv = new ContentValues();

        prop.forEach((item) -> {
            String fieldName = item.get("name").toString();
            String fieldType = item.get("type").toString();
            Boolean isNullableField = ((Integer) item.get("notnull")) != 0;
            if (fieldName.length() == 0 || fieldType.length() == 0 || fieldName.equals("id")) return;

            try {
                Field fld = classObj.getDeclaredField(fieldName);
                fld.setAccessible(true);
                Class<?> fldType = fld.getType();
                Object value = fld.get(cls);
                if (!isNullableField && value == null) return;

                if (fldType == String.class) {
                    cv.put(fieldName, (String) value);
                } else if (fldType == int.class || fldType == Integer.class) {
                    cv.put(fieldName, (Integer) value);
                } else if (fldType == long.class || fldType == Long.class) {
                    cv.put(fieldName, (Long) value);
                } else if (fldType == boolean.class || fldType == Boolean.class) {
                    cv.put(fieldName, (Boolean) value);
                } else if (fldType == float.class || fldType == Float.class) {
                    cv.put(fieldName, (Float) value);
                } else if (fldType == double.class || fldType == Double.class) {
                    cv.put(fieldName, (Double) value);
                } else if (fldType == byte[].class) {
                    cv.put(fieldName, (byte[]) value);
                } else if (fldType.isArray() || List.class.isAssignableFrom(fldType)) {
                    Gson gson = new GsonBuilder().create();
                    String jsonArr = gson.toJson(value);
                    cv.put(fieldName, jsonArr);
                } else {
                    throw new IllegalArgumentException("Unsupported field type: " + fld.getType());
                }
            } catch (Exception  e) {
                e.printStackTrace();
            }
        });
        return cv;
    }

    public <T> List<T> ParseMapIntoClass (@NonNull Class<T> cls, @NonNull List<Map<String, Object>> list) {
        //Class<?> classObj = cls.getClass();
        Class<?> classObj = cls;
        List<T> result = new ArrayList<>();

        list.forEach(map -> {
            try {
                T newClass = cls.getDeclaredConstructor().newInstance();
                map.forEach((fieldName, value) -> {
                    try {
                        Field fld = classObj.getDeclaredField(fieldName);
                        fld.setAccessible(true);

                        Class<?> fldType = fld.getType();
                        if (value == null) return;

                        if (fldType == String.class) {
                            fld.set(newClass, (String) value);
                        } else if (fldType == int.class || fldType == Integer.class) {
                            fld.set(newClass, ((Number) value).intValue());
                        } else if (fldType == long.class || fldType == Long.class) {
                            fld.set(newClass, ((Number) value).longValue());
                        } else if (fldType == boolean.class || fldType == Boolean.class) {
                            if (value instanceof Boolean) {
                                fld.set(newClass, (Boolean) value);
                            } else if (value instanceof Number) {
                                Boolean parsed = ((Number) value).intValue() != 0;
                                fld.set(newClass, (Boolean) parsed);
                            } else {
                                throw new IllegalArgumentException("Cannot convert value to boolean: " + value);
                            }
                        } else if (fldType == float.class || fldType == Float.class) {
                            fld.set(newClass, ((Number) value).floatValue());
                        } else if (fldType == double.class || fldType == Double.class) {
                            fld.set(newClass, ((Number) value).doubleValue());
                        } else if (fldType == byte[].class) {
                            fld.set(newClass, (byte[]) value);
                        } else if (fldType.isArray()) {
                            try {
                                Class<?> type = fldType.getComponentType();
                                Gson gson = new Gson();
                                Object array = gson.fromJson((String) value, type);
                                fld.set(newClass, array);
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        } else if (List.class.isAssignableFrom(fldType)) {
                            try {
                                Type listFieldType = ((ParameterizedType) fld.getGenericType()).getActualTypeArguments()[0];
                                Type listType = TypeToken.getParameterized(List.class, listFieldType).getType();
                                Gson gson = new Gson();
                                List<?> lst = gson.fromJson((String) value, listType);
                                fld.set(newClass, lst);
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        } else {
                            throw new IllegalArgumentException("Unsupported field type: " + fld.getType());
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                });
                result.add(newClass);
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
        return result;
    }
//endregion
}
