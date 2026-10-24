import NurLouisSkin from "@assets/team/nurlouis/skin.png"
import Mathias2246Skin from "@assets/team/mathias2246/skin.png"
import PekanTVSkin from "@assets/team/pekantv/skin.png"
import DarkylSkin from "@assets/team/darkyl/skin.png"
import ShxdowCrafterSkin from "@assets/team/shxdowcrafter/skin.png"
import PerrySkin from "@assets/team/perry/skin.png"
import Basti4457Skin from "@assets/team/basti4457/skin.png"
import NK151207Skin from "@assets/team/nk151207/skin.png"
import Creeper30Skin from "@assets/team/creeper3.0/skin.png"
import DerMinoSkin from "@assets/team/dermino/skin.png"

export interface Member {
    id: string;
    name: string;
    role: string;
    skin: string;
    description: string;
}

export const members: Member[] = [
    {
        id: "nurlouis",
        name: "NurLouis",
        role: "Founder & Server Owner",
        skin: NurLouisSkin.src,
        description: "<p>Ich bin das Louis, das die Schatten verschlang. Ich bin der Schatten, der das Louis erweckte. Ich bin das Louis der letzten Stunde.</p>"
    },
    {
        id: "mathias2246",
        name: "Mathias2246",
        role: "Founder & Lead Developer",
        skin: Mathias2246Skin.src,
        description: "<p><iframe width=\"100%\" height=\"100%\" src=\"https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?si=WZ9uxRqqDUZAi0q&controls=0&disablekb=1&autoplay=1\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen=\"\"></iframe></p>"
    },
    {
        id: "pekantv",
        name: "PekanTV",
        role: "Admin",
        skin: PekanTVSkin.src,
        description: "<p>Administrator auf Baggel.de</p>"
    },
    {
        id: "darkyl",
        name: "Darkyl",
        role: "Lead Developer",
        skin: DarkylSkin.src,
        description: "<p>Ich mache Musik und Programmiere</p> <p>:3</p> <p>Website: <a href='https://darkylmusic.com/' target='_blank' style='color: #009DFF; text-decoration: underline;'>darkylmusic.com</a><br>YouTube: <a href='https://www.youtube.com/channel/UC1vqivmEx6wSMN3GGzdMM4A' target='_blank' style='color: #009DFF; text-decoration: underline;'>YouTube</a><br>GitHub: <a href='https://github.com/Darkylt' target='_blank' style='color: #009DFF; text-decoration: underline;'>GitHub</a></p>"
    },
    {
        id: "shxdowcrafter",
        name: "ShxdowCrafter",
        role: "Admin & Developer",
        skin: ShxdowCrafterSkin.src,
        description: "<p style=\"text-align: center;\">Minigame-Dev & Drummer</p>"
    },
    {
        id: "perry",
        name: "Perry",
        role: "Admin",
        skin: PerrySkin.src,
        description: "<p>Ich bin zuständig für die Socials von Baggel und Programmiere auch Gamemodes.<br>Folgt mir auf <a href='https://www.twitch.tv/perrytheplatypus1252' target='_blank' style='color: #009DFF; text-decoration: underline;'>Twitch</a>.</p>"
    },
    {
        id: "basti4457",
        name: "Basti4457",
        role: "Moderator",
        skin: Basti4457Skin.src,
        description: "<p>Labert gerne scheiße ✔️</p> <a href='https://baggel.de/tools/bunnysuit/' target='_blank' style='color: #009DFF; text-decoration: underline;'>BunnySuit Tool</a><br><a href='https://baggel.de/tools/bed-tool/' target='_blank' style='color: #009DFF; text-decoration: underline;'>Bed Overlay Tool</a>"
    },
    {
        id: "nk151207",
        name: "NK151207",
        role: "Moderator",
        skin: NK151207Skin.src,
        description: "<p>Ich bin zu blöd für PVP/Skywars</p>"
    },
    {
        id: "creeper3.0",
        name: "Creeper3.0",
        role: "Builder",
        skin: Creeper30Skin.src,
        description: "<p>Ich bin builder und auch dabei.</p>"
    },
    {
        id: "dermino",
        name: "DerMino",
        role: "Builder",
        skin: DerMinoSkin.src,
        description: "<p>Jahrelange Baubegeisterung - Liebe zum Detail</p>"
    },
]