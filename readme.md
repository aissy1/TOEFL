PHP minimum versi 8.2+

to run project 
```
composer run dev
```

```
npm run dev
```

## Admin User Update

Saat mengedit user, password bersifat opsional. Perubahan nama, email, atau role
dapat disimpan tanpa mengisi password; password lama tetap dipertahankan.
Password hanya diganti jika password baru diisi dan konfirmasinya cocok dengan
panjang minimal 8 karakter.

Detail perilaku tersedia di `docs/admin-user-update-password-optional.md`.
