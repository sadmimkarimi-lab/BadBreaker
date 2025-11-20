// eitaa.js
// پل ارتباطی بازی بدشکن با WebApp ایتا
// فقط سمت مرورگر/وب‌ویو اجرا می‌شود (نه نود، نه سرور)

(function () {
  // چک کنیم اصلاً داخل ایتا هستیم یا نه
  const webApp = window.Eitaa && window.Eitaa.WebApp ? window.Eitaa.WebApp : null;

  if (!webApp) {
    console.log("Eitaa WebApp not detected. Running in normal browser mode.");
    return;
  }

  // --- تنظیمات اولیه وب‌اپ ایتا ---
  try {
    // اعلام آمادگی به ایتا
    webApp.ready();

    // صفحه کامل باز بشه
    if (webApp.expand) {
      webApp.expand();
    }

    // تم اولیه (با تم شب/سرمه‌ای بازی هماهنگ)
    if (webApp.setHeaderColor) {
      webApp.setHeaderColor("#020617"); // نزدیک به پس‌زمینه سرمه‌ای
    }
    if (webApp.setBackgroundColor) {
      webApp.setBackgroundColor("#020617");
    }

    console.log("Eitaa WebApp bridge for Badshkan initialized ✅");
  } catch (e) {
    console.error("Error initializing Eitaa WebApp:", e);
  }

  // --- واکنش به تغییر تم از سمت ایتا (اگر کاربر تم رو عوض کنه) ---
  if (webApp.onEvent) {
    webApp.onEvent("themeChanged", function () {
      const theme = webApp.themeParams || {};
      // اگر دوست داشتی می‌تونی اینجا یک event روی window بزنی
      // که index.html بر اساس theme، رنگ‌ها رو عوض کنه
      console.log("Eitaa theme changed:", theme);
    });
  }

  // --- هَپتیک (ویبره نرم) برای لحظه‌های خاص بازی ---
  function haptic(type) {
    if (!webApp || !webApp.HapticFeedback) return;

    try {
      switch (type) {
        case "hit": // برخورد توپ به آجر
          webApp.HapticFeedback.impactOccurred("light");
          break;
        case "power": // گرفتن پاورآپ خوب
          webApp.HapticFeedback.impactOccurred("medium");
          break;
        case "bad": // گرفتن توپ سیاه یا باخت جان
          webApp.HapticFeedback.notificationOccurred("error");
          break;
        case "win": // بردن لِول
          webApp.HapticFeedback.notificationOccurred("success");
          break;
        default:
          webApp.HapticFeedback.selectionChanged();
      }
    } catch (e) {
      console.warn("Haptic error:", e);
    }
  }

  // --- ارسال نتیجه بازی برای ربات (اختیاری) ---
  // می‌تونی سمت بات، web_app_data رو بگیری و ذخیره کنی
  function sendResultToBot(payload) {
    if (!webApp || !webApp.sendData) return;

    try {
      const data = {
        type: "badshkan_result",
        ...payload
      };
      webApp.sendData(JSON.stringify(data));
      console.log("Result sent to bot:", data);
    } catch (e) {
      console.error("sendResultToBot error:", e);
    }
  }

  // --- بستن وب‌اپ از داخل بازی (اختیاری) ---
  function closeWebApp() {
    if (!webApp || !webApp.close) return;
    try {
      webApp.close();
    } catch (e) {
      console.error("closeWebApp error:", e);
    }
  }

  // --- اکسپورت به صورت گلوبال برای استفاده داخل index.html ---
  // تو می‌تونی در index.html از این‌ها استفاده کنی:
  // window.BadshkanBridge.hitBrick()
  // window.BadshkanBridge.getPowerUp()
  // window.BadshkanBridge.badBall()
  // window.BadshkanBridge.levelCompleted(level, score, lives)
  // window.BadshkanBridge.gameOver(level, score, lives)
  // window.BadshkanBridge.close()

  window.BadshkanBridge = {
    // برخورد توپ با آجر عادی
    hitBrick: function () {
      haptic("hit");
    },

    // گرفتن پاورآپ خوب (مثلاً بزرگ شدن تخته، جون اضافه و ...)
    getPowerUp: function () {
      haptic("power");
    },

    // گرفتن توپ سیاه یا پاورآپ منفی
    badBall: function () {
      haptic("bad");
    },

    // تمام شدن یک مرحله
    levelCompleted: function (level, score, lives) {
      haptic("win");
      sendResultToBot({
        event: "level_completed",
        level,
        score,
        lives,
        ts: Date.now()
      });
    },

    // اتمام بازی
    gameOver: function (level, score, lives) {
      haptic("bad");
      sendResultToBot({
        event: "game_over",
        level,
        score,
        lives,
        ts: Date.now()
      });
    },

    // اگر خواستی دستی وب‌اپ رو ببندی
    close: function () {
      closeWebApp();
    }
  };

})();
