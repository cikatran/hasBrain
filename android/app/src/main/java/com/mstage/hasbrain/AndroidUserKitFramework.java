package com.mstage.hasbrain;

import android.annotation.SuppressLint;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.mstage.hasbrain.helper.MapUtil;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import io.reactivex.android.schedulers.AndroidSchedulers;
import io.reactivex.schedulers.Schedulers;
import userkit.sdk.UserKit;

/**
 * Created by henry on 4/2/18.
 */
public class AndroidUserKitFramework extends ReactContextBaseJavaModule {
    public static final String REACT_MODULE = "RNUserKit";
    Gson gson = new Gson();

    public AndroidUserKitFramework(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return REACT_MODULE;
    }

    @ReactMethod
    public void setDeviceType(String type) {
        UserKit.getInstance().setDeviceType(type);
    }

    @ReactMethod
    public void timeEvent(String name) {
        UserKit.getInstance().timeEvent(name);
    }

    @ReactMethod
    public void track(String name, ReadableMap properties) {
        UserKit.getInstance().track(name, properties.toHashMap());
    }

    @SuppressLint({"CheckResult", "RxLeakedSubscription"})
    @ReactMethod
    public void storeProperty(ReadableMap properties, Callback callback) {
        UserKit.getInstance().getProfileManager().set().putAll(properties.toHashMap()).commit()
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(() -> {
                    WritableNativeArray array = new WritableNativeArray();
                    WritableNativeMap map = new WritableNativeMap();
                    map.merge(properties);
                    array.pushMap(map);
                    callback.invoke(null, array);
                }, throwable -> callback.invoke(gson.toJson(throwable), null));
    }

    @ReactMethod
    public void storeProperties(String properties, Callback callback) {
        Type type = new TypeToken<Map<String, Object>>(){}.getType();
        Gson gson = new Gson();
        Map<String, Object> propertiesMap = new HashMap(gson.fromJson(properties, type));
        UserKit.getInstance().getProfileManager().set().putAll(propertiesMap).commit()
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(() -> {
                    callback.invoke(null, properties);
                }, throwable -> callback.invoke(gson.toJson(throwable), null));
    }

    @SuppressLint("CheckResult")
    @ReactMethod
    public void getProperty(String key, Callback callback) {
        ArrayList<String> temp = new ArrayList<String>();
        temp.add(key);
        UserKit.getInstance().getProfileManager().getProperties(temp, (result) -> {
            WritableNativeArray array = new WritableNativeArray();
            array.pushMap(MapUtil.toWritableMap(MapUtil.toMap(result)));
            callback.invoke(null, array);
        }, (error) -> {
            callback.invoke(gson.toJson(error), null);
        });
    }

    @SuppressLint({"CheckResult", "RxLeakedSubscription"})
    @ReactMethod
    public void appendProperty(ReadableMap properties, Callback callback) {
        UserKit.getInstance().getProfileManager().append().putAll(properties.toHashMap()).commit()
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(() -> {
                    WritableNativeArray array = new WritableNativeArray();
                    array.pushString("");
                    callback.invoke(null, array);
                }, throwable -> callback.invoke(gson.toJson(throwable), null));
    }

    @SuppressLint({"CheckResult", "RxLeakedSubscription"})
    @ReactMethod
    public void incrementProperty(ReadableMap properties, Callback callback) {
        UserKit.getInstance().getProfileManager().increment().putAll(properties.toHashMap()).commit()
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(() -> {
                    WritableNativeArray array = new WritableNativeArray();
                    array.pushString("");
                    callback.invoke(null, array);
                }, throwable -> callback.invoke(gson.toJson(throwable), null));
    }
}