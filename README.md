# maco165

https://maco165.github.io/

東京を拠点に開発をしています。Webアプリや、為替データを扱う自動化ツールなどを個人で作っています。

## Works

個人開発したアプリやツールです。ソースコードは GitHub で公開しています。

- **英単語道場**
  - 4択クイズで1000語を繰り返し学べる英単語学習Webアプリ。
  - 技術: React / Vite
  - 公開: https://maco165.github.io/english-vocab-app/
  - ソース: https://github.com/maco165/english-vocab-app
- **Forex Alert Bot for Discord**
  - 為替レート (USDJPY / EURJPY / GBPJPY) の市場クローズ時のレポートと急変動を Discord に通知する Bot。
  - 技術: Python / discord.py / OANDA API
  - リポジトリ: https://github.com/maco165/ForexAlertBot-discord.py
- **anime-guide**
  - アニメ作品の世界観を図で解説する、非公式のガイド。AI (Claude) がまとめ、誤りは Issue や Pull Request で直せる。
  - 技術: Markdown / SVG / Claude
  - 公開: https://maco165.github.io/anime-guide/
  - ソース: https://github.com/maco165/anime-guide
- **Rust Analysis**
  - ゲーム Rust の公式の変更点を日本語でまとめ、全アイテムの値を表にした、非公式のサイト。
  - 技術: Python / HTML / CSS / Claude
  - 公開: https://maco165.github.io/rust-patch-notes/
  - ページ: https://github.com/maco165/rust-patch-notes (生成したページだけ。作る仕組みとデータは非公開)

## Contact

お気軽にどうぞ。各サービスで活動しています。

- Twitter / X: [@maco165_rust](https://twitter.com/maco165_rust)
- GitHub: [maco165](https://github.com/maco165)
- Qiita: [@maco165](https://qiita.com/maco165)

## このリポジトリについて

- GitHub Pages で配信する静的サイト
- 中身は `index.html`、`css/style.css`、`js/trade.js`、`images/favicon.svg` の 4 ファイル。ビルド工程なし
- JavaScript は `js/trade.js` だけ。AI TRADE のセクションで、ハムスターがデモの相場を売買するアニメーションを動かす。数字はページ内の乱数で、実際の相場や取引とはつながっていない
- フォントは Google Fonts (JetBrains Mono / Space Grotesk / Noto Sans JP)
- アイコンはインライン SVG

## License

MIT ([LICENSE](LICENSE) を参照)
