// Authored practice, not a transcript or verified teacher/exam script.
const rows=`你会做饭吗？|Nǐ huì zuò fàn ma?|Bạn biết nấu ăn không?|我会做饭。|Wǒ huì zuò fàn.|Tôi biết nấu ăn.
你想买什么？|Nǐ xiǎng mǎi shénme?|Bạn muốn mua gì?|我想买衣服。|Wǒ xiǎng mǎi yīfu.|Tôi muốn mua quần áo.
你喜欢学汉语吗？|Nǐ xǐhuan xué Hànyǔ ma?|Bạn thích học tiếng Trung không?|我很喜欢学汉语。|Wǒ hěn xǐhuan xué Hànyǔ.|Tôi rất thích học tiếng Trung.
你会做中国菜吗？|Nǐ huì zuò Zhōngguó cài ma?|Bạn biết nấu món Trung Quốc không?|我不会做中国菜。|Wǒ bú huì zuò Zhōngguó cài.|Tôi không biết nấu món Trung Quốc.
你家有几口人？|Nǐ jiā yǒu jǐ kǒu rén?|Nhà bạn có mấy người?|我家有三口人。|Wǒ jiā yǒu sān kǒu rén.|Nhà tôi có ba người.
你的朋友叫什么名字？|Nǐ de péngyou jiào shénme míngzi?|Bạn của bạn tên là gì?|我的朋友叫小明。|Wǒ de péngyou jiào Xiǎomíng.|Bạn của tôi tên là Tiểu Minh.
你喜欢喝茶吗？|Nǐ xǐhuan hē chá ma?|Bạn thích uống trà không?|我喜欢喝茶。|Wǒ xǐhuan hē chá.|Tôi thích uống trà.
你在哪儿学习？|Nǐ zài nǎr xuéxí?|Bạn học ở đâu?|我在学校学习。|Wǒ zài xuéxiào xuéxí.|Tôi học ở trường.
你的老师怎么样？|Nǐ de lǎoshī zěnmeyàng?|Giáo viên của bạn thế nào?|我的老师很好。|Wǒ de lǎoshī hěn hǎo.|Giáo viên của tôi rất tốt.
你今天身体怎么样？|Nǐ jīntiān shēntǐ zěnmeyàng?|Hôm nay sức khỏe bạn thế nào?|我今天身体很好。|Wǒ jīntiān shēntǐ hěn hǎo.|Hôm nay sức khỏe tôi rất tốt.
下雨的时候，你喜欢做什么？|Xià yǔ de shíhou, nǐ xǐhuan zuò shénme?|Lúc trời mưa, bạn thích làm gì?|我喜欢在家看书。|Wǒ xǐhuan zài jiā kàn shū.|Tôi thích đọc sách ở nhà.
你喜欢吃什么水果？|Nǐ xǐhuan chī shénme shuǐguǒ?|Bạn thích ăn trái cây gì?|我喜欢吃苹果。|Wǒ xǐhuan chī píngguǒ.|Tôi thích ăn táo.
你喜欢猫吗？|Nǐ xǐhuan māo ma?|Bạn thích mèo không?|我很喜欢猫。|Wǒ hěn xǐhuan māo.|Tôi rất thích mèo.
你有电脑吗？|Nǐ yǒu diànnǎo ma?|Bạn có máy tính không?|我有一个电脑。|Wǒ yǒu yí ge diànnǎo.|Tôi có một máy tính.
你家有狗吗？|Nǐ jiā yǒu gǒu ma?|Nhà bạn có chó không?|我家有一只狗。|Wǒ jiā yǒu yì zhī gǒu.|Nhà tôi có một con chó.
你喜欢看电影吗？|Nǐ xǐhuan kàn diànyǐng ma?|Bạn thích xem phim không?|我喜欢和朋友看电影。|Wǒ xǐhuan hé péngyou kàn diànyǐng.|Tôi thích xem phim cùng bạn.
你想去北京吗？|Nǐ xiǎng qù Běijīng ma?|Bạn muốn đến Bắc Kinh không?|我想去北京。|Wǒ xiǎng qù Běijīng.|Tôi muốn đến Bắc Kinh.
你几点去学校？|Nǐ jǐ diǎn qù xuéxiào?|Bạn đi học lúc mấy giờ?|我七点去学校。|Wǒ qī diǎn qù xuéxiào.|Tôi đi học lúc bảy giờ.
星期天你想做什么？|Xīngqītiān nǐ xiǎng zuò shénme?|Chủ nhật bạn muốn làm gì?|我想去商店买东西。|Wǒ xiǎng qù shāngdiàn mǎi dōngxi.|Tôi muốn đến cửa hàng mua đồ.
你喜欢冷的天气吗？|Nǐ xǐhuan lěng de tiānqì ma?|Bạn thích thời tiết lạnh không?|我不喜欢冷的天气。|Wǒ bù xǐhuan lěng de tiānqì.|Tôi không thích thời tiết lạnh.
今天热吗？|Jīntiān rè ma?|Hôm nay nóng không?|今天很热，我想喝水。|Jīntiān hěn rè, wǒ xiǎng hē shuǐ.|Hôm nay rất nóng, tôi muốn uống nước.`;
export type Followup={question:string;pinyin:string;meaning:string;answer:string;answerPinyin:string;answerMeaning:string};
export const speakingFollowups:Record<string,Followup>=Object.fromEntries(rows.split('\n').map((r,i)=>{const [question,pinyin,meaning,answer,answerPinyin,answerMeaning]=r.split('|');return ['speaking-'+(i+1),{question,pinyin,meaning,answer,answerPinyin,answerMeaning}]}));
