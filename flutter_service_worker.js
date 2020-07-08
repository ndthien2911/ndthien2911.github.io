'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "543d6ae45b0359634d2984b4cf35fdcd",
"assets/FontManifest.json": "01700ba55b08a6141f33e168c4a6c22f",
"assets/fonts/MaterialIcons-Regular.ttf": "56d3ffdef7a25659eab6a68a3fbfaf16",
"assets/lib/assets/icons/cancel-regist.png": "4e7219af571ec26a957867bf95115bfa",
"assets/lib/assets/icons/complete.png": "557ef35c3e2f9a164942b1542d2a6121",
"assets/lib/assets/icons/current-idea.gif": "3c548de0ec9a511dc3a08d888dad009d",
"assets/lib/assets/icons/dialog-error.png": "b1aecd10cff04501fbd90f0bdb8eca2a",
"assets/lib/assets/icons/dialog-question.png": "b83529e423584da715d33b67c021e04e",
"assets/lib/assets/icons/dialog-success.png": "da188ccb78f1017e9645542bb5e52d6b",
"assets/lib/assets/icons/dialog-timer.png": "b9863827a19b6e8cfa00cf3f662fa7d6",
"assets/lib/assets/icons/dialog-voting.png": "2bb72464b74107771efcc69211dbde35",
"assets/lib/assets/icons/dialog-warning.png": "36678d0144e6a71f67fc54a50698708f",
"assets/lib/assets/icons/icon-me.png": "72d4849bc8a9d7a5405074f777179d2c",
"assets/lib/assets/icons/logout.png": "906834db1c2a5f279feccec219a83320",
"assets/lib/assets/icons/next-idea.png": "d13ac190004053e4c45b74fa35ffc184",
"assets/lib/assets/icons/notification-on.png": "7181cd26b5291414301eaece687c45e3",
"assets/lib/assets/icons/pdf.png": "e57dc3fa1ceee720c4a24e414069fcb5",
"assets/lib/assets/icons/qr-code.png": "65c4def7c7c0c1713dce306919b8e907",
"assets/lib/assets/icons/voting-background.gif": "19cdfacb80b955bc5fce6bf2176244df",
"assets/lib/assets/images/banner-login.png": "4b4cb7b8aff7bb9006f396591cffe958",
"assets/lib/assets/images/communist-flag.png": "d598c60ae65e6a7c8d1a5e18b6adb03f",
"assets/lib/assets/images/no-avatar.png": "0c8b6e9d0fd4a089d278fd71a8178cc1",
"assets/lib/assets/images/no-data.png": "6cbeecbb77aa9f9722ef75c0d05e8d50",
"assets/lib/assets/images/otp.png": "46f2c39580e79c5a6c012cac34b46b88",
"assets/lib/assets/images/QRcodeTest.png": "e0e52634990687cbde324443a6eade4f",
"assets/lib/assets/images/question-indicator-active.png": "1e90277edb411559a20df6fa4f1b269d",
"assets/lib/assets/images/question-indicator-inactive.png": "c9fd4578ddd1974e2c87ba07a6bc6aa8",
"assets/lib/assets/images/strikethrough.png": "34ebe869032be0a089209e9a9af02112",
"assets/lib/assets/images/underline.png": "c28a19d99d8a8e8d828800d6bd267198",
"assets/lib/assets/images/vietnam-flag.png": "29a2b9ecabcb425cb9eac24cb41cf450",
"assets/lib/assets/images/voting-completed.gif": "436d4030f6ec40429c0fa4615138039d",
"assets/NOTICES": "244eb5da2c9e0398836407824e3e6c38",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "115e937bb829a890521f72d2e664b632",
"assets/packages/progress_dialog/assets/double_ring_loading_io.gif": "e5b006904226dc824fdb6b8027f7d930",
"index.html": "1a27a9a73b6dc6fb67284c0abba27428",
"/": "1a27a9a73b6dc6fb67284c0abba27428",
"main.dart.js": "42d9d45f89c9d184489ab58af392ed49"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/LICENSE",
"assets/AssetManifest.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      // Provide a no-cache param to ensure the latest version is downloaded.
      return cache.addAll(CORE.map((value) => new Request(value, {'cache': 'no-cache'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');

      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }

      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#')) {
    key = '/';
  }
  // If the URL is not the the RESOURCE list, skip the cache.
  if (!RESOURCES[key]) {
    return event.respondWith(fetch(event.request));
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache. Ensure the resources are not cached
        // by the browser for longer than the service worker expects.
        var modifiedRequest = new Request(event.request, {'cache': 'no-cache'});
        return response || fetch(modifiedRequest).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.message == 'skipWaiting') {
    return self.skipWaiting();
  }

  if (event.message = 'downloadOffline') {
    downloadOffline();
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey in Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.add(resourceKey);
    }
  }
  return Cache.addAll(resources);
}
