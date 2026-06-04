#!/usr/bin/env bash
# Corrige react-native-ir-manager@0.0.4 (compile() supprimé dans Gradle 7+)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GRADLE="$ROOT/node_modules/react-native-ir-manager/android/build.gradle"

if [ ! -f "$GRADLE" ]; then
  echo "patch-react-native-ir-manager: package absent, ignoré"
  exit 0
fi

cat > "$GRADLE" << 'EOF'
def safeExtGet(prop, fallback) {
    rootProject.ext.has(prop) ? rootProject.ext.get(prop) : fallback
}

apply plugin: 'com.android.library'

android {
    namespace "com.danielr18.irmanager"
    compileSdk safeExtGet('compileSdkVersion', 36)
    buildToolsVersion safeExtGet('buildToolsVersion', '36.0.0')

    defaultConfig {
        minSdkVersion safeExtGet('minSdkVersion', 24)
        targetSdkVersion safeExtGet('targetSdkVersion', 36)
    }

    lint {
        abortOnError false
    }
}

dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])
    implementation 'com.facebook.react:react-android:+'
}
EOF

JAVA_PKG="$ROOT/node_modules/react-native-ir-manager/android/src/main/java/com/danielr18/irmanager/IRManagerReactPackage.java"
if [ -f "$JAVA_PKG" ]; then
  cat > "$JAVA_PKG" << 'EOF'
package com.danielr18.irmanager;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class IRManagerReactPackage implements ReactPackage {

  @Override
  public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
    return Collections.emptyList();
  }

  @Override
  public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
    List<NativeModule> modules = new ArrayList<>();
    modules.add(new RNIRManagerModule(reactContext));
    return modules;
  }
}
EOF
  echo "patch-react-native-ir-manager: IRManagerReactPackage.java mis à jour"
fi

JAVA_MODULE="$ROOT/node_modules/react-native-ir-manager/android/src/main/java/com/danielr18/irmanager/RNIRManagerModule.java"
if [ -f "$JAVA_MODULE" ]; then
  cat > "$JAVA_MODULE" << 'EOF'
package com.danielr18.irmanager;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import android.hardware.ConsumerIrManager;
import android.hardware.ConsumerIrManager.CarrierFrequencyRange;

import static android.content.Context.CONSUMER_IR_SERVICE;

public class RNIRManagerModule extends ReactContextBaseJavaModule {

  private static final String MODULE_NAME = "RNIRManagerModule";
  private final ConsumerIrManager manager;

  public RNIRManagerModule(ReactApplicationContext reactContext) {
    super(reactContext);
    manager = (ConsumerIrManager) reactContext.getSystemService(CONSUMER_IR_SERVICE);
  }

  @Override
  public String getName() {
    return MODULE_NAME;
  }

  @ReactMethod
  public void hasIrEmitter(Promise promise) {
    try {
      promise.resolve(manager != null && manager.hasIrEmitter());
    } catch (Exception e) {
      promise.reject("IR_ERROR", e);
    }
  }

  @ReactMethod
  public void getCarrierFrequencies(Promise promise) {
    try {
      if (manager == null || !manager.hasIrEmitter()) {
        promise.resolve(Arguments.createArray());
        return;
      }
      CarrierFrequencyRange[] ranges = manager.getCarrierFrequencies();
      WritableArray carrierFrequencies = Arguments.createArray();

      for (CarrierFrequencyRange range : ranges) {
        WritableMap carrierFrequency = Arguments.createMap();
        carrierFrequency.putInt("minFrequency", range.getMinFrequency());
        carrierFrequency.putInt("maxFrequency", range.getMaxFrequency());
        carrierFrequencies.pushMap(carrierFrequency);
      }

      promise.resolve(carrierFrequencies);
    } catch (Exception e) {
      promise.reject("IR_ERROR", e);
    }
  }

  @ReactMethod
  public void transmit(Integer carrierFrequency, ReadableArray burstsPattern, Promise promise) {
    if (manager == null || !manager.hasIrEmitter()) {
      promise.reject("IR_UNAVAILABLE", "No IR emitter on this device");
      return;
    }

    int[] pattern = new int[burstsPattern.size()];

    for (int i = 0; i < burstsPattern.size(); i++) {
      pattern[i] = burstsPattern.getInt(i);
    }

    try {
      manager.transmit(carrierFrequency, pattern);
      promise.resolve(true);
    } catch (Exception e) {
      promise.reject("IR_ERROR", e);
    }
  }

  @ReactMethod
  public void transmitProntoCode(String prontoHexCode, Promise promise) {
    if (manager == null || !manager.hasIrEmitter()) {
      promise.reject("IR_UNAVAILABLE", "No IR emitter on this device");
      return;
    }

    String[] codeParts = prontoHexCode.split(" ");

    if (codeParts.length < 4) {
      promise.reject("IR_INVALID", "Invalid Pronto code");
      return;
    }

    int prontoClockFrequency = Integer.parseInt(codeParts[1], 16);
    int carrierFrequency = (int) (1000000 / (prontoClockFrequency * 0.241246));
    int firstSequenceBurstPairs = Integer.parseInt(codeParts[2], 16);
    int secondSequenceBurstPairs = Integer.parseInt(codeParts[3], 16);
    int[] pattern = new int[(firstSequenceBurstPairs * 2) + (secondSequenceBurstPairs * 2)];

    int i = 0;
    int firstPairIndex = 4;
    int secondPairIndex = firstPairIndex + (firstSequenceBurstPairs * 2);

    for (int j = firstPairIndex; j < secondPairIndex; i++, j++) {
      pattern[i] = Integer.parseInt(codeParts[j], 16) * (1000000 / carrierFrequency);
    }

    for (int j = secondPairIndex; j < secondPairIndex + (secondSequenceBurstPairs * 2); i++, j++) {
      pattern[i] = Integer.parseInt(codeParts[j], 16) * (1000000 / carrierFrequency);
    }

    try {
      manager.transmit(carrierFrequency, pattern);
      promise.resolve(true);
    } catch (Exception e) {
      promise.reject("IR_ERROR", e);
    }
  }
}
EOF
  echo "patch-react-native-ir-manager: RNIRManagerModule.java mis à jour"
fi

echo "patch-react-native-ir-manager: build.gradle mis à jour"
