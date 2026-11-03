const marks: Record<string, string[]> = {
  a: ["ā", "á", "ǎ", "à"],
  e: ["ē", "é", "ě", "è"],
  i: ["ī", "í", "ǐ", "ì"],
  o: ["ō", "ó", "ǒ", "ò"],
  u: ["ū", "ú", "ǔ", "ù"],
  ü: ["ǖ", "ǘ", "ǚ", "ǜ"],
};
const all =
  "a ai an ang ao ba bai ban bang bao bei ben beng bi bian biao bie bin bing bo bu ca cai can cang cao ce cen ceng cha chai chan chang chao che chen cheng chi chong chou chu chua chuai chuan chuang chui chun chuo ci cong cou cu cuan cui cun cuo da dai dan dang dao de dei den deng di dia dian diao die ding diu dong dou du duan dui dun duo e ei en eng er fa fan fang fei fen feng fo fou fu ga gai gan gang gao ge gei gen geng gong gou gu gua guai guan guang gui gun guo ha hai han hang hao he hei hen heng hong hou hu hua huai huan huang hui hun huo ji jia jian jiang jiao jie jin jing jiong jiu ju juan jue jun ka kai kan kang kao ke ken keng kong kou ku kua kuai kuan kuang kui kun kuo la lai lan lang lao le lei leng li lia lian liang liao lie lin ling liu lo long lou lu luan lun luo lü lüe ma mai man mang mao me mei men meng mi mian miao mie min ming miu mo mou mu na nai nan nang nao ne nei nen neng ni nian niang niao nie nin ning niu nong nou nu nuan nuo nü nüe o ou pa pai pan pang pao pei pen peng pi pian piao pie pin ping po pou pu qi qia qian qiang qiao qie qin qing qiong qiu qu quan que qun ran rang rao re ren reng ri rong rou ru ruan rui run ruo sa sai san sang sao se sen seng sha shai shan shang shao she shei shen sheng shi shou shu shua shuai shuan shuang shui shun shuo si song sou su suan sui sun suo ta tai tan tang tao te teng ti tian tiao tie ting tong tou tu tuan tui tun tuo wa wai wan wang wei wen weng wo wu xi xia xian xiang xiao xie xin xing xiong xiu xu xuan xue xun ya yan yang yao ye yi yin ying yo yong you yu yuan yue yun za zai zan zang zao ze zei zen zeng zha zhai zhan zhang zhao zhe zhei zhen zheng zhi zhong zhou zhu zhua zhuai zhuan zhuang zhui zhun zhuo zi zong zou zu zuan zui zun zuo";
const syllables = new Set(all.split(" "));
export type PinyinMode = "numbered" | "formal" | "ime";
export function normalizePinyin(
  value: string,
  mode: PinyinMode = "numbered",
): string {
  let input = value
    .normalize("NFC")
    .toLowerCase()
    .trim()
    .replace(/[’‘]/g, "'")
    .replace(/u:/g, "ü");
  if (mode === "formal" && /[v0-9]/.test(input)) return "!invalid";
  if (mode !== "formal") input = input.replace(/v/g, "ü");
  if (mode === "ime")
    return input
      .normalize("NFD")
      .replace(/[\u0300\u0301\u0304\u030c]/g, "")
      .normalize("NFC")
      .replace(/ü/g, "v")
      .replace(/[\s'0-5]/g, "");
  input = input.replace(/([0-5])/g, "$1 ");
  const chunks = input.split(/[\s']+/).filter(Boolean);
  const out: string[] = [];
  for (const chunk of chunks) {
    const numbered = /([0-5])$/.exec(chunk);
    const chars = Array.from(chunk.replace(/[0-5]$/, ""));
    if (!chars.length) return "!invalid";
    const tones: number[] = [];
    const bare = chars
      .map((c, i) => {
        for (const [base, arr] of Object.entries(marks)) {
          const t = arr.indexOf(c);
          if (t >= 0) {
            tones[i] = t + 1;
            return base;
          }
        }
        return c;
      })
      .join("");
    // Longest valid segmentation; explicit apostrophes remain boundaries.
    const parse = (pos: number): string[] | null => {
      if (pos === bare.length) return [];
      for (let end = Math.min(pos + 6, bare.length); end > pos; end--) {
        let s = bare.slice(pos, end);
        s = s.replace(/^([jqxy])ü/, "$1u");
        if (!syllables.has(s)) continue;
        const ts = tones.slice(pos, end).filter(Boolean);
        if (ts.length > 1) continue;
        const tail = parse(end);
        if (!tail) continue;
        const tone =
          ts[0] ||
          (end === bare.length && numbered ? Number(numbered[1]) || 5 : 5);
        if (numbered && ts[0] && tone !== (Number(numbered[1]) || 5)) continue;
        return [s + tone, ...tail];
      }
      return null;
    };
    const parsed = parse(0);
    if (!parsed) return "!invalid";
    out.push(...parsed);
  }
  return out.join(" ");
}
export function accentedPinyin(value: string): string {
  const normalized = normalizePinyin(value);
  if (normalized === "!invalid") return normalized;
  return normalized
    .split(" ")
    .map((word) => {
      const tone = Number(word.at(-1));
      let s = word.slice(0, -1);
      if (tone === 5) return s;
      let i = s.indexOf("a");
      if (i < 0) i = s.indexOf("e");
      if (i < 0 && s.includes("ou")) i = s.indexOf("o");
      if (i < 0) {
        for (let j = s.length - 1; j >= 0; j--)
          if (marks[s[j]]) {
            i = j;
            break;
          }
      }
      return i < 0 ? s : s.slice(0, i) + marks[s[i]][tone - 1] + s.slice(i + 1);
    })
    .join(" ");
}
export function checkPinyin(
  input: string,
  expected: string,
  mode: PinyinMode = "numbered",
): boolean {
  const a = normalizePinyin(input, mode),
    b = normalizePinyin(expected, mode);
  if (!a || a === "!invalid" || a !== b) return false;
  if (mode === "formal") {
    const canonical = accentedPinyin(input).replace(/\s/g, "");
    return (
      input
        .normalize("NFC")
        .toLowerCase()
        .replace(/[\s'’]/g, "") === canonical
    );
  }
  return true;
}
export function canSubmit(composing: boolean, nativeComposing = false) {
  return !composing && !nativeComposing;
}
