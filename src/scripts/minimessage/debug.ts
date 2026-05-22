export {};

const DEBUG_TEXT = `Normal unformatted text


Preset colors:
<black>black</black> <dark_gray>dark_gray</dark_gray> <dark_grey>dark_grey</dark_grey> <dark_blue>dark_blue</dark_blue> <blue>blue</blue> <dark_green>dark_green</dark_green> <green>green</green> <dark_aqua>dark_aqua</dark_aqua> <aqua>aqua</aqua> <dark_red>dark_red</dark_red> <red>red</red> <dark_purple>dark_purple</dark_purple> <light_purple>light_purple</light_purple> <gold>gold</gold> <yellow>yellow</yellow> <gray>gray</gray> <grey>grey</grey> <white>white</white>

Verbose Hex colors:
<color:#aabbcc>Long format</color>, <color:#abc>Short format</color>

Hex colors:
<#aabbcc>Long format</#aabbcc>, <#abc>Short format</#abc>

Shadow preset colors:
<shadow:black>black</shadow> <shadow:dark_gray>dark_gray</shadow> <shadow:dark_grey>dark_grey</shadow> <shadow:dark_blue>dark_blue</shadow> <shadow:blue>blue</shadow> <shadow:dark_green>dark_green</shadow> <shadow:green>green</shadow> <shadow:dark_aqua>dark_aqua</shadow> <shadow:aqua>aqua</shadow> <shadow:dark_red>dark_red</shadow> <shadow:red>red</shadow> <shadow:dark_purple>dark_purple</shadow> <shadow:light_purple>light_purple</shadow> <shadow:gold>gold</shadow> <shadow:yellow>yellow</shadow> <shadow:gray>gray</shadow> <shadow:grey>grey</shadow> <shadow:white>white</shadow>

Shadow opacity:
<!shadow>Disabled <shadow:white:0>0</shadow> <shadow:white>Unspecified</shadow> <shadow:white:1>Full</shadow>

Shadow hex colors:
<shadow:#aabbcc:1>Long format</shadow> <shadow:#abc:1>Short format</shadow>


Decorations:
<bold>Bold</bold> <italic>Italic</italic> <underlined>Underlined</underlined> <strikethrough>Strikethrough</strikethrough> <obfuscated>Obfuscated</obfuscated>

Aliases
<b>Bold</b> <em>Italic (em)</em> <i>Italic (i)</i> <u>Underlined</u> <st>Strikethrough</st> <obf>Obfuscated</obf>


Gradients:
<gradient:#ff0000:#00ff00:#0000ff>Long Gradient Across Text</gradient>
<gradient:red:blue>Short Gradient</gradient>
<rainbow>Rainbow Text Test</rainbow>
<rainbow:!>Inverted Rainbow Text Test</rainbow>

<pride>Pride</pride>
<pride:trans>Transgender</pride>
<pride:bi>Bisexual</pride>
<pride:pan>Pansexual</pride>
<pride:nb>Nonbinary</pride>
<pride:lesbian>Lesbian</pride>
<pride:ace>Asexual</pride>
<pride:agender>Agender</pride>
<pride:demisexual>Demisexual</pride>
<pride:genderqueer>Genderqueer</pride>
<pride:genderfluid>Genderfluid</pride>
<pride:intersex>Intersex</pride>
<pride:aro>Aromanticism</pride>
<pride:baker>Baker</pride>
<pride:philly>Philly</pride>
<pride:queer>Queer</pride>
<pride:gay>Gay</pride>
<pride:bigender>Bigender</pride>
<pride:demigender>Demigender</pride>

Transition:
<transition:white:black:red:0>0</transition>
<transition:white:black:red:0.0625>0.0625</transition>
<transition:white:black:red:0.125>0.125</transition>
<transition:white:black:red:0.1875>0.1875</transition>
<transition:white:black:red:0.25>0.25</transition>
<transition:white:black:red:0.3125>0.3125</transition>
<transition:white:black:red:0.375>0.375</transition>
<transition:white:black:red:0.4375>0.4375</transition>
<transition:white:black:red:0.5>0.5</transition>
<transition:white:black:red:0.5625>0.5625</transition>
<transition:white:black:red:0.625>0.625</transition>
<transition:white:black:red:0.6875>0.6875</transition>
<transition:white:black:red:0.75>0.75</transition>
<transition:white:black:red:0.8125>0.8125</transition>
<transition:white:black:red:0.875>0.875</transition>
<transition:white:black:red:0.9375>0.9375</transition>
<transition:white:black:red:1>1</transition>

Translatables:
You should get a <red><lang:block.minecraft.diamond_block></red>!

Keybinds:
Jump: <red><key:key.jump></red> | Sneak: <red><key:key.sneak></red> | Sprint: <red><key:key.sprint></red> | Attack: <red><key:key.attack></red> | Use: <red><key:key.use></red> | Pick Item: <red><key:key.pickItem></red> | Player List: <red><key:key.playerlist></red> | Fullscreen: <red><key:key.fullscreen></red> | Toggle Perspective: <red><key:key.togglePerspective></red> | Spectator Hotbar: <red><key:key.spectatorHotbar></red> | Screenshot: <red><key:key.screenshot></red> | Drop: <red><key:key.drop></red> | Command: <red><key:key.command></red>

Fonts:
Nothing <font:uniform>Uniform <font:alt>Alt </font> Uniform


Newline:<newline><br>
Heads:
<head:Darkylt> Darkylt. <red><head:Darkylt> Darkylt in red.</red> <red><shadow:green:1><head:Darkylt> Darkylt in red with green shadow.</shadow></red>
<head:Darkylt:false> Darkylt without overlay.
<head:NurLouis> NurLouis.
<head:5f9d5824-75b2-43cd-8f5a-9a5e1deaf141> UUID.
<head:player/wide/steve> Texture


Stress tests:
<bold>Bold <italic>Bold+Italic <underlined>Bold+Italic+Underlined</underlined> Still Bold+Italic</italic> Back to Bold</bold> Normal.

<color:#47FF19>L</color><color:#FF4000>o</color><color:#0A2BFF>t</color><color:#03FF68>'</color><color:#FFD21C>s</color> <color:#8CFF98>o</color><color:#FF0090>f</color> <color:#DEFF91>c</color><color:#7AFFB4>o</color><color:#FF5CA5>l</color><color:#FF367F>o</color><color:#00FF88>r</color> <color:#6CFF47>s</color><color:#EEFF00>p</color><color:#0048FF>a</color><color:#FFB947>m</color>


Weird tag stuff:

<shadow:#00ff15:1>Closed shadow tag with an <red>unclosed color tag with</shadow> normal text after

Escaped tags:
\\<red>This should NOT be red\\</red>
\\<blue>Backslash before tag</blue>
Literal angle brackets: < not a tag > and </ not closing >
Mixed escaping: \\<bold>\<italic>text\</italic></bold>

Explicit reset:
<red>Red <bold>Red+Bold <reset>After reset (normal) <italic>Italic only</italic>

Reset inside nested:
<green>Green <bold>Bold <reset>Normal <underlined>Underlined only</underlined> Normal again

Crossed tags:
<bold><italic>Bold+Italic</bold> Still Italic?</italic> Normal

Color crossing:
<red><blue>Blue inside red</red> Still blue?</blue> Normal

Bad hex:
<#zzzzzz>Invalid hex</#zzzzzz>
<color:#12>Too short</color>
<shadow:#abcd:2>Opacity out of range</shadow>
<shadow:red:-1>Negative opacity</shadow>

Bad gradient:
<gradient:#ff0000>Only one color</gradient>
<gradient:>Empty</gradient>

Bad transition phase:
<transition:red:blue:notanumber>Bad phase</transition>
<transition:red:blue:2>Phase > 1</transition>

Whitespace in tags:
<red >Space before close bracket</red >
< red>Space after open bracket</ red>
<gradient: red : blue >Spaced gradient</gradient>

Case variants:
<RED>Uppercase</RED>
<BoLd>Mixed Case Bold</bOlD>
<GrAdIeNt:#ff0000:#00ff00>Case Gradient</gRaDiEnT>

Adjacent tags:
<red></red><blue>Blue after empty red</blue>
<bold><italic></italic></bold>Empty styled segment


Unclosed at end:
<green>Green <bold>Green+Bold <italic>Green+Bold+Italic
`;


function insertDebugMiniMessage(): void {
  const textarea = document.getElementById("input") as HTMLTextAreaElement | null;
  if (!textarea) {
    console.warn("MiniMessage debug: #input textarea not found");
    return;
  }

  textarea.value = DEBUG_TEXT;
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
  textarea.dispatchEvent(new Event("change", { bubbles: true }));
  textarea.focus();
  console.info("MiniMessage debug text inserted.");
}

declare global {
  interface Window {
    insertMiniMessageDebug: () => void;
  }
}

window.insertMiniMessageDebug = insertDebugMiniMessage;

