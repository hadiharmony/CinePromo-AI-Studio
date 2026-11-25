const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require("@firebase/rules-unit-testing");
const { test, before, after, beforeEach } = require("node:test");
const fs = require("node:fs");

let testEnv;
const PROJECT_ID = process.env.GCP_PROJECT || "demo-no-project";
const ALICE_UID = "alice_seller_123";
const BOB_UID = "bob_other_456";

const [emulatorHost, emulatorPortStr] = (
  process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8085"
).split(":");
const emulatorPort = parseInt(emulatorPortStr, 10);

function validCampaignPayload(uid, timestamp = new Date(Date.now() - 5000)) {
  return {
    userId: uid,
    title: "Glow Serum Vitamin C — Video & Photo Ads",
    productName: "Luminance Vit-C Glow Serum",
    productDescription: "Serum pencerah wajah dengan 15% Vitamin C stabil dan Niacinamide.",
    productBenefits: "Mencerahkan kulit kusam dalam 14 hari, ringan tanpa lengket.",
    productPhotoPreview: "",
    language: "id",
    format: "reels_9_16",
    visualVibe: "luxury_editorial",
    subtitleStyle: "kinetic_pop",
    status: "generated",
    productionMode: "both",
    priceText: "Rp 149.000",
    discountText: "DISKON 30%",
    promoBadgeText: "BEST SELLER",
    targetAudience: "Wanita aktif usia 20-35 pecinta skincare praktis",
    musicVibe: "Upbeat Luxury House 122 BPM",
    ctaText: "Checkout sekarang sebelum diskon 30% berakhir!",
    scenes: [
      {
        sceneNumber: 1,
        beatRole: "Hook",
        headlineOverlay: "KULIT KUSAM HILANG?",
        narration: "Cukup 3 tetes tiap pagi untuk kulit glowing natural seharian.",
        visualPrompt: "Close-up luxury amber serum bottle on wet marble pedestal with golden rim light.",
        cameraMotion: "ZoomIn",
        transition: "BeatCut",
        durationSec: 4,
        startSec: 0,
        endSec: 4,
        sfxCue: "Crisp glass chime + bass drop",
      },
    ],
    subtitles: [
      {
        index: 1,
        startMs: 0,
        endMs: 2000,
        text: "Cukup 3 tetes tiap pagi",
        highlightWord: "3 tetes",
        style: "kinetic_pop",
      },
    ],
    photoAds: [
      {
        variationId: "var_1",
        variationName: "Luxury Marble Hero",
        template: "luxury",
        aspectRatio: "4:5",
        headline: "GLOWING ALAMI 14 HARI",
        subheadline: "15% Vitamin C Stabil • Ringan & Cepat Meresap",
        priceText: "Rp 149.000",
        discountText: "DISKON 30%",
        promoBadgeText: "BEST SELLER",
        ctaText: "BELI SEKARANG",
        backgroundPrompt: "Dark veined marble pedestal with warm golden studio rim light and soft water droplets",
        lightingPreset: "golden_rim",
        fontStyle: "display_bold",
        layoutStyle: "center_hero",
        textScale: 1.0,
        objectScale: 1.0,
        objectOffsetX: 0.0,
        objectOffsetY: 0.0,
        shadowIntensity: 0.75,
        reflectionIntensity: 0.45,
        accentHex: "#FFC857",
        bgStartHex: "#181326",
        bgEndHex: "#08060F",
      },
    ],
    socialHooks: [
      {
        angle: "Curiosity",
        hookText: "Rahasia kulit glowing tanpa filter yang lagi viral minggu ini!",
        score: 96,
      },
    ],
    socialPackages: [
      {
        platform: "tiktok",
        hook: "Rahasia kulit glowing tanpa filter!",
        caption: "Cukup 3 tetes Luminance Vit-C Glow Serum setiap pagi.",
        cta: "Klik keranjang kuning sekarang mumpung promo!",
        hashtags: ["#skincareindonesia", "#serumvitc", "#glowingskin"],
      },
    ],
    totalDurationSec: 4,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

before(async () => {
  const rules = fs.readFileSync("./firestore.rules", "utf8");
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules,
      host: emulatorHost,
      port: emulatorPort,
    },
  });
});

after(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});

beforeEach(async () => {
  if (testEnv) {
    await testEnv.clearFirestore();
  }
});

test("Unauthenticated user cannot read or write promoCampaigns", async () => {
  const unauthDb = testEnv.unauthenticatedContext().firestore();
  const ref = unauthDb.collection("users").doc(ALICE_UID).collection("promoCampaigns");
  await assertFails(ref.get());
  await assertFails(ref.doc("camp_1").get());
  await assertFails(ref.doc("camp_1").set(validCampaignPayload(ALICE_UID)));
});

test("Authenticated owner can create, list, get, partially update photoAds/video, and delete", async () => {
  const aliceDb = testEnv.authenticatedContext(ALICE_UID).firestore();
  const ref = aliceDb.collection("users").doc(ALICE_UID).collection("promoCampaigns");
  const created = new Date(Date.now() - 10000);

  await assertSucceeds(ref.get());
  await assertSucceeds(ref.doc("camp_serum").set(validCampaignPayload(ALICE_UID, created)));
  await assertSucceeds(ref.doc("camp_serum").get());

  await assertSucceeds(
    ref.doc("camp_serum").update({
      productionMode: "photo",
      priceText: "Rp 129.000",
      discountText: "HEMAT 40%",
      photoAds: [
        {
          variationId: "var_2",
          variationName: "Beauty Soft Editorial",
          template: "beauty",
          aspectRatio: "1:1",
          headline: "CERAH SEKETIKA",
          subheadline: "Formula klinis untuk kulit bercahaya",
          priceText: "Rp 129.000",
          discountText: "HEMAT 40%",
          promoBadgeText: "FLASH SALE",
          ctaText: "ORDER WA SEKARANG",
        },
      ],
      status: "ready",
      updatedAt: new Date(Date.now() - 1000),
    })
  );

  await assertSucceeds(ref.doc("camp_serum").delete());
});

test("Rejects bad productionMode, shadow fields, @DocumentId 'id', future timestamps, and immutable changes", async () => {
  const aliceDb = testEnv.authenticatedContext(ALICE_UID).firestore();
  const ref = aliceDb.collection("users").doc(ALICE_UID).collection("promoCampaigns");
  const created = new Date(Date.now() - 10000);

  await assertFails(
    ref.doc("camp_mode").set({ ...validCampaignPayload(ALICE_UID, created), productionMode: "audio_only" })
  );
  await assertFails(
    ref.doc("camp_ghost").set({ ...validCampaignPayload(ALICE_UID, created), extraFlag: true })
  );
  await assertFails(
    ref.doc("camp_id").set({ ...validCampaignPayload(ALICE_UID, created), id: "camp_id" })
  );
  await assertFails(
    ref.doc("camp_future").set(validCampaignPayload(ALICE_UID, new Date(Date.now() + 60000)))
  );

  await assertSucceeds(ref.doc("camp_imm").set(validCampaignPayload(ALICE_UID, created)));
  await assertFails(
    ref.doc("camp_imm").update({ createdAt: new Date(Date.now() - 500), updatedAt: new Date(Date.now() - 500) })
  );
  await assertFails(
    ref.doc("camp_imm").update({ userId: BOB_UID, updatedAt: new Date(Date.now() - 500) })
  );
});

test("Cross-user isolation blocks Alice from accessing or modifying Bob's promoCampaigns", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context
      .firestore()
      .collection("users")
      .doc(BOB_UID)
      .collection("promoCampaigns")
      .doc("bob_camp_1")
      .set(validCampaignPayload(BOB_UID));
  });

  const aliceDb = testEnv.authenticatedContext(ALICE_UID).firestore();
  const bobRef = aliceDb.collection("users").doc(BOB_UID).collection("promoCampaigns");

  await assertFails(bobRef.get());
  await assertFails(bobRef.doc("bob_camp_1").get());
  await assertFails(
    bobRef.doc("bob_camp_1").update({ title: "Hijacked", updatedAt: new Date(Date.now() - 1000) })
  );
  await assertFails(bobRef.doc("bob_camp_1").delete());
});
