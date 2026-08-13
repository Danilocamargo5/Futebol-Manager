---
name: Flutter toolchain availability
description: The current workspace does not provide an installable Flutter or Dart module.
---

Flutter source can be authored in the workspace, but it cannot be compiled, previewed, or packaged here unless the environment later exposes the Flutter SDK. Keep platform-folder generation instructions in the project README.

**Why:** The available artifact bootstrap options do not include Flutter and the environment module registry returned no Flutter toolchain.

**How to apply:** For future mobile requests, ask whether Expo/React Native is acceptable before building a runnable artifact; if Flutter is required, deliver source with explicit local validation steps.