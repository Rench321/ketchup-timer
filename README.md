<div align="center">
  <img src="./public/icon.svg" alt="Ketchup App Icon" width="128" />
  <h1>Ketchup</h1>
  
  <p>A compact desktop Pomodoro timer built with <b>Tauri v2</b> and <b>React</b>. Features an unconventional flexible work/break switching mechanic — you own your own time.</p>
  
  <p>
    <a href="https://tauri.app/"><img src="https://img.shields.io/badge/Tauri-v2-FFC131?style=flat-square&logo=tauri&logoColor=white" alt="Tauri"></a>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React"></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="License"></a>
  </p>

  <img src="./landing/assets/demo.gif" alt="App Demo" width="320" />
</div>

## ✨ Features

- **🔁 Flexible Phase Switching:** Switch between Work and Break at any moment. Share a time budget across a cycle!
- **⚙️ Configuration Management:** Easily swap presets or create your own custom duration setups.
- **🔊 Sound Notifications:** Elegant, built-in Web Audio API alerts for phase transitions.
- **🎨 Premium UI:** Frameless window, fluid animations, and dual SVG rings.

---

## 📥 Downloads

Get the latest version of Ketchup for your platform from the [Releases](../../releases) page:

<p>
  <a href="../../releases"><img src="https://img.shields.io/badge/macOS-000000?style=flat-square&logo=apple&logoColor=white" alt="Download for macOS"></a>
  <a href="../../releases"><img src="https://img.shields.io/badge/Windows-0078D6?style=flat-square&logo=windows&logoColor=white" alt="Download for Windows"></a>
  <a href="../../releases"><img src="https://img.shields.io/badge/Linux-FCC624?style=flat-square&logo=linux&logoColor=black" alt="Download for Linux"></a>
</p>

> [!WARNING]
> **Windows users:** You may see a SmartScreen warning because the app is not code-signed yet and has few downloads. Click *"More info"* → *"Run anyway"* to proceed.

> [!WARNING]
> **macOS users:** The app is not notarized yet (requires Apple Developer account).  
> If you see *"Ketchup is damaged"*, open Terminal and run:
> ```bash
> xattr -cr /Applications/Ketchup.app
> ```

---

## 🛠 Build from Source

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18
- [Rust](https://rustup.rs/) (stable toolchain)
- [Tauri v2 prerequisites](https://v2.tauri.app/start/prerequisites/) for your OS

### Build

```bash
npm run tauri build
```

The compiled installer will be available in the `src-tauri/target/release/bundle/` directory.

---

## 🤝 Contributing

Contributions are always welcome! If you have any ideas, suggestions, or bug reports, feel free to open an issue or create a pull request.

---

## 💖 Support / Donations

If you find this timer helpful and want to support its further development, donations are highly appreciated. 

<table>
  <tr>
    <td align="center">
      <b>USDT (TRC-20) / TRX (Tron)</b><br><br>
      <img src="docs/qr-codes/USDT.jpg" width="150" alt="USDT QR Code"><br><br>
      <code>TSfo5D6ppU6BXjArhLmQqF9Wn2DubwrskN</code>
    </td>
    <td align="center">
      <b>Bitcoin (BTC)</b><br><br>
      <img src="docs/qr-codes/BTC.jpg" width="150" alt="BTC QR Code"><br><br>
      <code>bc1qwme9mt8z9rvmg6yk6lydwwepvq4gtmx7t6peww</code>
    </td>
  </tr>
  <tr>
    <td align="center">
      <b>Ethereum (ETH)</b><br><br>
      <img src="docs/qr-codes/ETH.jpg" width="150" alt="ETH QR Code"><br><br>
      <code>0x1D7E5aBe8202783305C2297c900df052636032AB</code>
    </td>
    <td align="center">
      <b>TON</b><br><br>
      <img src="docs/qr-codes/TON.jpg" width="150" alt="TON QR Code"><br><br>
      <code>UQBerf_nhuloww36ipxr00lKsSjQ6Ub_709Raz8D_6yi2GgW</code>
    </td>
  </tr>
</table>
