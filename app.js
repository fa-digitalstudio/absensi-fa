// app.js
// ✅ FUNGSI LOADING
function tampilkanLoading(teks = "Sabar ya😇 Sedang Memuat...") {
    document.getElementById('loadingText').textContent = teks;
    document.getElementById('loadingOverlay').classList.add('active');
}
function sembunyikanLoading() {
    document.getElementById('loadingOverlay').classList.remove('active');
}

// 🚀 Daftarkan Service Worker untuk PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(reg => console.log('Service Worker terdaftar:', reg))
            .catch(err => console.log('Gagal daftar Service Worker:', err));
    });
}

let dataKaryawan = {};
let posisi = { lat: null, lon: null, gpsAktif: false, lokasiPalsu: false };
let streamKamera = null;
let fotoAbsen = null;
let perangkatDiRoot = false;

// --- Fungsi Popup ---
function tampilkanPopupGps() {
    document.getElementById('popupGps').classList.add('active');
}
function tutupPopupGps() {
    document.getElementById('popupGps').classList.remove('active');
}

function tampilkanPopupRoot() {
    document.getElementById('popupRoot').classList.add('active');
}
function tutupPopupRoot() {
    document.getElementById('popupRoot').classList.remove('active');
}

function tampilkanPopupFakeGps() {
    document.getElementById('popupFakeGps').classList.add('active');
}
function tutupPopupFakeGps() {
    document.getElementById('popupFakeGps').classList.remove('active');
}

function konfirmasiKeluar() {
    document.getElementById('popupKeluar').classList.add('active');
}
function tutupPopupKeluar() {
    document.getElementById('popupKeluar').classList.remove('active');
}
function lakukanKeluar() {
    tutupPopupKeluar();
    prosesLogoutAsli();
}

function tampilkanPopupSukses(teks = "Berhasil!") {
    document.getElementById('teksSukses').textContent = teks;
    document.getElementById('popupSukses').classList.add('active');
}
function tutupPopupSukses() {
    document.getElementById('popupSukses').classList.remove('active');
}

function tampilkanPopupGagal(teks = "Terjadi kesalahan") {
    document.getElementById('teksGagal').textContent = teks;
    document.getElementById('popupGagal').classList.add('active');
}
function tutupPopupGagal() {
    document.getElementById('popupGagal').classList.remove('active');
}

// --- Fungsi Deteksi Perangkat Di-Root ---
function cekPerangkatRoot() {
    const ua = navigator.userAgent.toLowerCase();
    const indikatorRoot = ['su', 'root', 'superuser', 'magisk', 'test-keys', 'debug'];
    return indikatorRoot.some(kata => ua.includes(kata));
}

// --- Fungsi Deteksi Lokasi Palsu ---
function cekLokasiPalsu(hasilGps) {
    const akurasi = hasilGps.coords.accuracy;
    const kecepatan = hasilGps.coords.speed || 0;
    return akurasi < 1 || akurasi > 2000 || kecepatan > 100;
}

// --- Cek Status Keamanan ---
function cekStatusKeamanan() {
    perangkatDiRoot = cekPerangkatRoot();
    const el = document.getElementById('peringatanKeamanan');
    el.style.display = perangkatDiRoot ? 'block' : 'none';
    if (perangkatDiRoot) tampilkanPopupRoot();
}

// --- Simpan & Cek Login ---
function simpanLogin(data) {
    localStorage.setItem("dataKaryawan", JSON.stringify(data));
}

function cekLoginTersimpan() {
    tampilkanLoading("Memuat data...");
    setTimeout(() => {
        const tersimpan = localStorage.getItem("dataKaryawan");
        if (tersimpan) {
            dataKaryawan = JSON.parse(tersimpan);
            tampilkanHalamanUtama();
            ambilLokasi();
            muatRiwayatAbsenTabel();
        }
        sembunyikanLoading();
    }, 800);
}

cekLoginTersimpan();

// --- Proses Login ---
function prosesLogin() {
    const hp = document.getElementById("inputHp").value.trim();
    const sandi = document.getElementById("inputSandi").value.trim();

    if (!hp || !sandi) {
        tampilkanPopupGagal("Masukkan nomor HP dan kata sandi!");
        return;
    }

    tampilkanLoading("Memproses login...");
    db.ref("data_karyawan").orderByChild("hp").equalTo(hp).once("value")
        .then(snap => {
            if (!snap.exists()) throw new Error("Nomor HP tidak terdaftar!");
            const data = snap.val();
            const kunci = Object.keys(data)[0];
            const d = data[kunci];
            if (d.sandi !== sandi) throw new Error("Kata sandi salah!");

            dataKaryawan = d;
            simpanLogin(d);
            catatAktivitas(d.nama, "login");
            tampilkanHalamanUtama();
            ambilLokasi();
            muatRiwayatAbsenTabel();
        })
        .catch(err => {
            sembunyikanLoading();
            tampilkanPopupGagal("❌ " + err.message);
        })
        .finally(() => sembunyikanLoading());
}

// --- Tampilkan Halaman Utama ---
function tampilkanHalamanUtama() {
    document.getElementById("halamanLogin").style.display = "none";
    document.getElementById("halamanUtama").style.display = "block";
    document.getElementById("namaPengguna").value = dataKaryawan.nama;
}

// --- Proses Logout ---
function prosesLogoutAsli() {
    catatAktivitas(dataKaryawan.nama, "logout");
    localStorage.removeItem("dataKaryawan");
    dataKaryawan = {};
    posisi = { lat: null, lon: null, gpsAktif: false, lokasiPalsu: false };
    document.getElementById("halamanUtama").style.display = "none";
    document.getElementById("halamanLogin").style.display = "block";
    document.getElementById("inputHp").value = "";
    document.getElementById("inputSandi").value = "";
    if (streamKamera) {
        streamKamera.getTracks().forEach(track => track.stop());
        streamKamera = null;
    }
}

// --- Ambil Lokasi GPS ---
function ambilLokasi() {
    if (!navigator.geolocation) {
        posisi.gpsAktif = false;
        tampilkanPopupGps();
        return;
    }

    tampilkanLoading("Mengambil lokasi...");
    navigator.geolocation.getCurrentPosition(
        (hasil) => {
            const palsu = cekLokasiPalsu(hasil);
            posisi = {
                lat: Number(hasil.coords.latitude.toFixed(6)),
                lon: Number(hasil.coords.longitude.toFixed(6)),
                gpsAktif: true,
                lokasiPalsu: palsu
            };
            if (palsu) tampilkanPopupFakeGps();
            sembunyikanLoading();
        },
        (err) => {
            posisi.gpsAktif = false;
            posisi.lokasiPalsu = false;
            sembunyikanLoading();
            tampilkanPopupGps();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

// --- Buka Kamera ---
function bukaKamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        tampilkanPopupGagal("Kamera tidak didukung di perangkat ini!");
        return;
    }
    tampilkanLoading("Membuka kamera...");
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
        .then(stream => {
            streamKamera = stream;
            const video = document.getElementById("videoKamera");
            video.srcObject = stream;
            video.play();
            document.querySelector(".camera-area").style.display = "block";
            document.getElementById("hasilFoto").style.display = "none";
            sembunyikanLoading();
        })
        .catch(() => {
            sembunyikanLoading();
            tampilkanPopupGagal("Izin akses kamera ditolak!");
        });
}

// --- Ambil Foto ---
function ambilFoto() {
    const video = document.getElementById("videoKamera");
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const konteks = canvas.getContext("2d");
    konteks.drawImage(video, 0, 0, canvas.width, canvas.height);
    fotoAbsen = canvas.toDataURL("image/jpeg", 0.8);
    document.getElementById("hasilFoto").src = fotoAbsen;
    document.getElementById("hasilFoto").style.display = "block";
    document.querySelector(".camera-area").style.display = "none";
    if (streamKamera) {
        streamKamera.getTracks().forEach(track => track.stop());
        streamKamera = null;
    }
}

// --- Lakukan Absen ---
function lakukanAbsen() {
    if (!fotoAbsen) {
        tampilkanPopupGagal("Ambil foto bukti terlebih dahulu!");
        return;
    }
    if (!posisi.gpsAktif) {
        tampilkanPopupGps();
        return;
    }
    if (perangkatDiRoot) {
        tampilkanPopupRoot();
        return;
    }
    if (posisi.lokasiPalsu) {
        tampilkanPopupFakeGps();
        return;
    }

    const jenis = document.getElementById("jenisAbsen").value;
    const keterangan = document.getElementById("keterangan").value.trim() || "-";
    const sekarang = new Date();
    const tgl = sekarang.toISOString().slice(0, 10);
    const jam = sekarang.toTimeString().slice(0, 8);

    const data = {
        nama: dataKaryawan.nama,
        hp: dataKaryawan.hp,
        status: jenis,
        keterangan: keterangan,
        tanggal: tgl,
        jam: jam,
        foto: fotoAbsen,
        lat: posisi.lat,
        lon: posisi.lon,
        gps_aktif: posisi.gpsAktif,
        lokasi_palsu: posisi.lokasiPalsu,
        perangkat_root: perangkatDiRoot,
        waktu_server: firebase.database.ServerValue.TIMESTAMP
    };

    tampilkanLoading("Mengirim data absen...");
    document.getElementById("btnKirimAbsen").disabled = true;
    document.getElementById("btnKirimAbsen").textContent = "⏳ Mengirim...";

    db.ref("riwayat_absen").push(data)
        .then(() => {
            tampilkanPopupSukses("✅ Absen berhasil dikirim!");
            document.getElementById("keterangan").value = "";
            document.getElementById("hasilFoto").style.display = "none";
            fotoAbsen = null;
            ambilLokasi();
            muatRiwayatAbsenTabel();
        })
        .catch(err => tampilkanPopupGagal("❌ Gagal: " + err.message))
        .finally(() => {
            sembunyikanLoading();
            document.getElementById("btnKirimAbsen").disabled = false;
            document.getElementById("btnKirimAbsen").textContent = "KIRIM ABSENSI";
        });
}

// --- Muat Riwayat Absen ---
function muatRiwayatAbsenTabel() {
    db.ref("riwayat_absen")
        .orderByChild("hp")
        .equalTo(dataKaryawan.hp)
        .limitToLast(20)
        .on("value", snap => {
            const data = snap.val() || {};
            let html = "";
            if (Object.keys(data).length === 0) {
                html = "<tr><td colspan='7' class='kosong'>Belum ada riwayat absen</td></tr>";
            } else {
                Object.values(data).reverse().forEach(d => {
                    const kelas = d.status === "Masuk" ? "status-masuk" : "status-pulang";
                    const gps = d.gps_aktif ? "✅ Aktif" : "❌ Tidak Aktif";
                    let keamanan = "✅ Aman";
                    if (d.perangkat_root || d.lokasi_palsu) keamanan = "⚠️ Mencurigakan";
                    const lokasi = d.lat && d.lon ? `${d.lat}, ${d.lon}` : "-";

                    html += `
                    <tr>
                        <td>${d.tanggal}</td>
                        <td>${d.jam}</td>
                        <td class="${kelas}">${d.status}</td>
                        <td>${d.keterangan}</td>
                        <td>${lokasi}</td>
                        <td>${gps}</td>
                        <td>${keamanan}</td>
                    </tr>`;
                });
            }
            document.getElementById("isiTabelRiwayat").innerHTML = html;
        });
}

// --- Catat Aktivitas Login/Logout ---
function catatAktivitas(nama, jenis) {
    const waktu = new Date().toLocaleString("id-ID");
    db.ref("riwayat_aktivitas").push({ nama, jenis, waktu });
}

// Jalankan cek keamanan saat halaman dimuat
cekStatusKeamanan();
