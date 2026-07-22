// Two [END] markers missing in the source wiki page (before "Ülesanded" and before
// "Auditlogid") were added here to keep section parsing correct — a bug in the wiki
// page itself, so re-pulling the raw wiki content will drop them again; re-add if so.
// The CAT-tool section (translationTool) has no "## " heading of its own in the wiki
// page; a synthetic "## Tõlketööriist" heading was added here so it parses/titles
// like every other section — keep the space after "##" or the API won't render it
// as a heading.
const translationAgencyManualText = `# Kasutusjuhend

[START]
## Kasutajate haldus

**Kasutaja lisamine**

Uute kasutajate lisamiseks klõpsa nupule „Lisa kasutajad“. Kasutaja(te) lisamiseks süsteemi tuleb importida kasutaja(te) andmed CSV-failiga. Laadi mall alla siit ([kasutajad_utf.csv](https://github.com/keeleinstituut/tv-tolkevarav/files/15483853/kasutajad_utf.csv)). Pane tähele, et kasutaja meiliaadress ei tohi sisaldada täpitähti.

**Kasutaja andmete haldamine**

Kasutajate andmete haldamiseks tuleb klõpsata valitud kasutaja kasutajakonto ID-lingile.  Kasutaja kontaktandmete vaates saab teha järgmist:
* määrata tema tööaegu,
* lisada puhkuseid,
* muuta kasutaja nime, meiliaadressi, telefoninumbrit ja üksust,
* muuta tema konto rolli (juurdepääsuõiguseid) ning
* kontot deaktiveerida/arhiveerida.

Igal kasutajal saab olla vaid **ainult üks roll**, kui on vaja kasutajajale anda mitme erineva rolli privileegid, siis tuleb süsteemi luua juurde uus roll. 

**Aktiveerimine/arhiveerimine**

Konto deaktiveerimisel kasutaja juurdepääsuõigused peatatakse ja tema roll(id) võetakse ära. See sobib kasutaja juurdepääsu ajutiseks peatamiseks. Kui pole soovi kontot hiljem taas aktiveerida, siis tuleks kasutaja konto arhiveerida.  
Kui kasutaja konto deaktiveeritakse ja kasutaja pole ise oma poolikuid töid kolleegidele suunanud, siis on vaid vastavate õigustega kasutajal juurdepääs tema poolikutele tellimustele, alamtellimustele ja ülesannetele. Deaktiveeritud konto aktiveerimiseks tuleb klõpsata nupule „Aktiveeri konto“ ja kontole määrata roll. Kasutaja juurdepääs taastatakse ja ta näeb endaga seotud tellimuste, alamtellimuste või ülesannete ajalugu, kui tema uus roll seda lubab.  
Aktiveeritud/deaktiveeritud kasutajale ei saa uut kontot samas asutuses luua. Arhiveeritud kasutajaga seotud isikukoodile saab uue konto luua: süsteemis luuakse uue unikaalse identifikaatoriga konto, mis on kasutaja isikukoodiga seotud ja sellega seotakse ka kõik uued tellimused (vana kontoga seotud tellimusi selle kontoga ei näe).

[END]

[START]
## Kasutajate lisamine

Kasutaja lisamiseks süsteemi tuleb importida kasutaja andmed CSV-failiga. Laadi faili mall alla siit ([kasutajad_utf.csv](https://github.com/keeleinstituut/tv-tolkevarav/files/15483853/kasutajad_utf.csv)). Kasutaja(te) lisamine töötab vaid selle malliga.
Kontode loomiseks tuleb failis kasutajate andmetega täita vajalikud andmeväljad. Pärast faili üleslaadimist palun kontrollida, et kõik andmed oleksid korrektsed ja vajadusel parandada vead. Kui kõik andmed on korrektsed, siis klõpsa „Salvesta ja saada teavitused“ nupule. Seejärel saavad kõik uued kasutajad teate, et neile on loodud konto Tõlkeväravas.

[BREAK]

Soovitus: igal asutusel peaks olema vähemalt kaks asutuse peakasutajat.

[END]

[START]

## Rollihaldus

Soovitame Tõlkeväravasse luua järgmised rollid:  

* teostaja;  
* tõlkekorraldaja;  
* asutuse peakasutaja. 

Iga asutuse peakasutaja saab luua uusi rolle, rolle kustutada ja ümber nimetada. Asutuse rollidele antud privileege saab muuta vaid asutuse peakasutaja. Rollide arv, nendega seotud privileegid ja rollide nimetused võivad erineda sõltuvalt asutuse vajadustest.

**Rollide haldamisega seotud privileegid:**  
* „Rollihalduse tabeli vaatamine“ – lubab rollide tabelit vaadata;  
* „Rolli lisamine süsteemi“ – lubab rollide tabelise lisada juurde uusi rolle;  
* „Rolli muutmine (privileegide lisamine/ eemaldamine)“ – lubab olemasolevate rollide privileege muuta;  
* „Rolli kustutamine“ – lubab rolle kustutada.  

Link rollide seadistamise näidisele, mis aitab rolle luua ja seadistada: 
[Rollide-privileegide-tabel-valiste-partnerite-institutisioon_16.07.2026.xlsx](https://github.com/user-attachments/files/30125154/Rollide-privileegide-tabel-valiste-partnerite-institutisioon_16.07.2026.xlsx)


Märkus. Igale kasutajale tuleb määrata **ainult üks roll**. See välistab olukorra, kus ühele kasutajale määratud erinevate privileegidega rollid on vastuolus.


[END]

[START]

## Tellimused

Tellimuste lehel kuvatakse kõiki sisseloginud kasutajaga jagatud tellimusi. 
Kui kasutajale on antud õigus näha ka asutuse teisi tellimusi, siis saab eemaldada linnukese valikust „Soovin näha vaid oma tellimusi“ ja seejärel kuvatakse kõiki tellimusi. 
Lisaks saab tellimusi filtreerida tellimuse ID, viitenumbri, keelesuuna, tüübi, staatuse, tähtaja ja loomisaja järgi. Tellimuse sildid, maksumus ja tellija ei ole välisele partnerile filtreeritavad.

[BREAK]

**Tellimuste staatused**  
* „Uus“ – uus tellimus, millel puudub tellijapoolne tõlkekorraldaja  
* „Registreeritud“ – uus tellimus, millele on määratud tellijapoolne tõlkekorraldaja  
* „Edastatud“ – tellijale saadetud valmis tellimus  
* „Tagasi lükatud“ – tellija poolt tagasi lükatud ja parandamist vajav valmis tellimus  
* „Parandatud“ – tellijale saadetud parandatud valmis tellimus  
* „Vastuvõetud“ – tellija poolt vastu võetud valmis tellimus

**Tellimuse hierarhia:** tellimus -> alamtellimus -> ülesanne. Ülesannete kohta saab tellija koostada päringuid ja neid tellimuseks vormistada.

**Mis infot saab tellimuse, alamtellimuse ja ülesande ID-st?**  

**Näide tellimuse ID-st: ABC-2027-07-T-123**

**1. Tellija asutuse lühend:** iga tellimuse ID algab tellija asutuse lühendiga ja see annab kasutajale märku, kes on tellimuse teinud.

**2. Tellimuse loomise aeg**: igas tellimuse numbris on viide aastale ja kuule, millal tellimus on loodud.

**3. Tellimuse tüüp**: tüüp viitab tellitud teenusele (nt „Tõlkimine, Toimetamine“ või „Vandetõlge“ jne). Välise teostajana ei pruugi tellija asutus alati töösse saata kõiki tellimuse tüübi all olevaid ülesandeid. Nimelt saab tellija tööd jagada ka osadeks ja määrata ülesanded kas ühele ja samale või eri teostajatele. Tellimuse tüübi lühend on ka iga tellimuse ID-s ja see annab kasutajale märku, mis teenuse tüübiga on tegu:

* Suuline tõlge – S;
* Järeltõlge – JÄ;
* Sünkroontõlge – SÜ;
* Viipekeel – VK;
* Tõlkimine(CAT), Ülevaatus – T;
* Tõlkimine(CAT) – T;
* Tõlkimine, Ülevaatus – T;
* Tõlkimine – T;
* Toimetamine, Ülevaatus – TO;
* Toimetamine – TO;
* Toimetatud tõlge, Ülevaatus – TO;
* Toimetatud tõlge – TT;
* Tõlkimine(CAT), Toimetamine, Ülevaatus – TT;
* Tõlkimine(CAT), Toimetamine – TT;
* Tõlkimine, Toimetamine, Ülevaatus – TT;
* Tõlkimine, Toimetamine – TT;
* Käsikirjaline tõlge, Ülevaatus – KT;
* Käsikirjaline tõlge – KT;
* Terminoloogia töö – TR;
* Vandetõlge (CAT), Ülevaatus – VT;
* Vandetõlge (CAT) – VT;
* Vandetõlge, Ülevaatus – VT;
* Vandetõlge – VT.

Märkus. Sulgudes lühend CAT tellimuse tüübi nimes viitab sellele, et teenuse osaks on kirjalik tõlkimine tõlketööriistas.

**4. Tellimuse enda number:** viimane tellimuse ID osa on tellimuse enda unikaalne number.

**Näide alamtellimuse ID-st: ABC-2027-07-T-123-et-EEen-GB-1**

**5. Keelepaar ja alamtellimuse number:** alamtellimuse vaates kuvatakse tellimuse ID järel ka keelepaar ja alamtellimuse number. Ülal näites on keelepaar eesti keelest inglise keelde ning alamtellimuse number on üks.

**Näide ülesande ID-st: ABC-2027-07-T-123-et-EEen-GB-1/1.1**

**6. Ülesande number:** ülesande vaates kuvatakse alamtellimuse ID järel ka ülesande number. Ülal näites on ülesande number üks.


[END]

[START]

## Alamtellimused  

Alamtellimuste lehel kuvatakse kõiki kasutajale nähtavaid alamtellimusi. 

Kui kasutajale on antud juurdepääs, et näha ka asutuse teisi alamtellimusi, siis saab eemaldada linnukese valikust „Soovin näha vaid oma tellimusi“ ja kuvatakse kõiki alamtellimusi.

Lisaks saab alamtellimusi filtreerida ID, seotud viite, keelesuuna, tüübi, staatuse, tähtaja ja loomisaja järgi. Tellimuse sildid, maksumus ja tellija ei ole välisele partnerile filtreeritavad.

[BREAK] 

**Alamtellimuste staatused** 

* „Uus“ - alamtellimusele ei ole teostajat määratud
* „Teostajale edastatud“ - ülesanne on saadetud teostajale ootel ülesannete alla
* „Teostamisel“ - alamtellimuse ülesanne on saadetud teostajale ja see on tema poolt töösse võetud
* „Teostatud“ - alamtellimuse ülesanne on teostaja poolt lõpetatuks märgitud

Juhul kui pärast teostaja valimist alamtellimuse staatus ei muutu, tuleks sellest kirjutada tellijale. Tellija asutuse tõlkekorraldaja peab alamtellimuse ülesandeid jagama ka teostajatega enda poolelt.

Tühistatud tellimused kaovad välise teostaja tellimuste loetelust täielikult. Tühistamise kohta saavad kasutajad meiliteate.

**Töö määramine teostajatele ja töö failidega**
* Kui tellija on päringu tellimuseks vormistanud, saab tõlkekorraldaja alamtellimuse ülesandele määrata teostaja. Asutuse alla lisatud teostajad (tõlkijad, tõlgid ja toimetajad) avanevad nupust **„Lisa andmebaasist“**. Valida saab ühe teostaja või mitu ning seejärel liigub alamtellimus staatusesse **„Teostajale edastatud“** ja kõik nimekirja lisatud teostajad saavad selle kohta kirja. Kes esimesena töö vastu võtab, sellele süsteem selle määrab ja alamtellimuse staatus muutub **„Teostamisel“**. Juhul kui pärast teostaja valimist alamtellimuse staatus ei muutu ja teostaja ülesannet enda ootel ülesannete all ei näe, tuleb sellest kirjutada tellijale. Tellija asutuse tõlkekorraldaja peab alamtellimuse ülesandeid jagama ka teostajatega.
* Kui teostaja saab tööülesande valmis, siis saab tema valmis tööfaile alla laadida, neid kontrollida ja seejärel tellijale suunata. 

Märkus. Teostaja saab ülesandeid vastu võtta vaid minu ülesannete kaudu. Kui tõlkebüroo tõlkekorraldaja ja teostaja on sama isik, siis tõlkekorraldajana saab tellimust korraldada alamtellimuste kaudu ja teostajana minu ülesannete vaate kaudu.

Kui teostajat on vaja vahetada, siis seda saab igal ajal teha. Selleks võib kustutada olemasoleva teostaja ja lisada uue teostaja.

[END]

[START]

## Minu ülesanded

Minu ülesannete lehel kuvatakse kõiki sisseloginud kasutajaga seotud ülesandeid. Võimalik on vaadata aktiivseid ja ootel ülesandeid ning teostatud ülesannete ajalugu. Lisaks saab ülesandeid filtreerida ID, viite, keelesuuna, maksumuse, tüübi, siltide, tähtaja, loomisaja, algusaja ja tellija järgi.


[END]

[START]

## Tellimuse detailid

Tellimuse detailide all kuvatakse tellimuse üldandmeid, tellija tõlkekorraldaja andmeid ja tellimuse lähte- ja abifaile.
Väline teostaja ei saa tellimuse andmeid muuta. Seda saab teha vaid tellija asutus. Kui tellimuse andmeid on vaja muuta (nt kui midagi on puudu), siis tuleks sellest tellijale teada anda.

**Alamtellimuse haldamine**

Sõltuvalt teenuse tüübist saab tõlkekorraldaja alamtellimuse all teha järgmist.
* Valida teostajate andmebaasist ülesannetele teostajad (tõlkijad, tõlgid, toimetajad jt).
* Teostajate valmis tööfaile alla ja üles laadida, kontrollida ja tellijale suunata.

[END]

[START]

## Päringud

Päringuid kuvatakse väliste teostajate kasutajatele, kellele on tema asutuse sätetest lisatud privileegid „Päringute vaatamine“ ja „Päringutele vastamine“. Väline teostaja saab lehel „Päringud“ hallata kõiki tema asutusele saadetud päringuid.  

Päringuid saab filtreerida staatuse järgi (ootel, aktsepteeritud, vastatud, keeldutud, pakkumus tagasi lükatud ja aegunud) ja otsida ülesande ID, tellija, töö tüübi, keelesuuna või päringule vastamise tähtaja järgi.  

Päringule klõpsates avaneb selle detailvaade, kus on näha tellija kontaktandmed, erijuhised, tellimuse andmed (tellimuse tüüp, valdkond, tellimuse tähtaeg, keelesuunad, maht, lähtefailid jms). Kasutaja saab detailvaatest päringule vastata: vajadusel sisestada hinna, lisada kommentaari ja päringu kas vastu võtta või sellest keelduda. Vastuse esitamisel saadetakse päringu saatnud tellijale selle kohta automaatne teavitus.  

**Päringute nimekirjas kuvatakse järgmiseid andmeid**  
* Ülesande ID: ülesande ID, mille kohta päring tehti
* Tellija: asutus, kes päringu saatis
* Tellija e-post: tellija asutuse üldine kontakt
* Töö tüüp: teenus, mida tellija vajab.
* Keelesuund: päringu lähte- ja sihtkeel
* Staatus: päringu staatus
* Tähtaeg: päringule vastamise tähtaeg

[BREAK]  

Päringu avamisel kuvatakse päringu detailid kahes osas.  

**Päringu andmed**  
* Tellija nimi, asutus, meil ja telefoninumber  
* Päringule vastamise tähtaeg  
* Erijuhised päringu kohta  

**Tellimuse andmed**  
* Tellimuse ID ja tüüp
* Valdkond
* Tähtaeg (suulise tõlke puhul kuvatakse ka algusaeg, kestus ning tellimuse viis: kaugtõlge/kontakttõlge koos aadressi või lingiga)
* Erijuhised tellimuse kohta
* Lähtekeel ja sihtkeel
* Lähtefailid (kui need on päringuga jagatud)
* Maht  

**Päringule vastamine**  

Päringule klõpsates avaneb selle detailvaade ja päringu allosas saab väljale „Hind“ sisestada kogumaksumuse (kui tellija seda küsib). Lisaks saab vabatekstiväljale lisada tellijale kommentaari. Seejärel saab väline teostaja teada anda, kas ta on valmis pakutava töö vastu võtma või keeldub.
* **„Keeldu“**: päringu staatuseks määratakse „Keeldutud“. Süsteem palub enne keeldumise kinnitamist lisada kommentaari. Pärast keeldumist ei saa väline teostaja päringut enam muuta ega sellele uuesti vastata ja jagatud failid pole enam kättesaadavad.
* **„Võta päring vastu“**: süsteem saadab tellijale vastava teavituse ning kasutajale kuvatakse teade „Päring on vastu võetud ja edastatud tellijale ülevaatamiseks“.  
* Kui teostaja ei jõua reageerimisaja jooksul vastata, määrab süsteem päringu staatuseks automaatselt **„Aegunud“** ja päring pole enam kättesaadav.
Keeldumise, vastuvõtmise ja aegumise kohta saadetakse tellijale automaatteade meili teel.  

[END]

[START]

## Teostajate andmebaas

Teostajate andmebaasis kuvatakse kõik asutuse kasutajad, kes on teostajate andmebaasi lisatud. Uute teostajate süsteemi lisamiseks või olemasolevate teostajate eemaldamiseks tuleb klõpsata menüüst „Teostajate andmebaas“ nupule „Lisa/eemalda teostajaid“.

Teostaja konto andmete vaates saab hallata temaga kokkulepitud keelepaare ja oskusi.

Tõlkevärava kasutajakontod on seotud kasutaja isikukoodi ja nimega. Teostajate andmebaasi lisatud kasutajatele on võimalik lisada ka „Lepingupartneri ärinimi“. Kui teenust osutab FIE, OÜ, vms ja mitte eraisik või põhikohaga töötaja, siis saab teostajale lisada ka ärinime või viite koostöövormile. 

[BREAK]

[END]

[START]

## Ülesanded
Ülesannete lehel kuvatakse kõiki kasutajaga seotud aktiivseid ülesandeid.

[END]


[START]

## Tõlketööriist

**Mida on tõlketööriistaga tõlkimiseks vaja?**   

Tõlkevärava tõlketööriist on veebipõhine. Sellega saab töötada vaid veebibrauseris ja arvutis peab olema internetiühendus, et luua ühendus tõlkemälu, masintõlkemootori ja Ekilexiga.

**Mis juhtub, kui internetiühendus katkeb?**   

Tõlkevärav on mõeldud kasutajatele, kellel on internetiühendus.
Ajutise internetiühenduse katkemise korral saab siiski kuni 20 segmenti tõlkida. Tõlkevärav sünkroonib tõlgitud segmendid, kui ühendus taastub.  


**Kiirklahvide otseteed** 

Tõlkevärava tõlketööriistas saab kasutada otseteena **kiirklahve**. Vormindamise ja funktsionaalsuste otseteede tundmaõppimine aitab tõlkijal olla produktiivsem ja kiiremini tõlkida. Otseteede nimekirja saab avada, klõpsates tõlketööriista kasutajaliidese ülemisel kolme punktiga tähistatud nupule „Kiirklahvid“.  


**Tõlke allalaadimine tõlketööriistast**  

Tõlketeksti saab alla laadida alamtellimuse vaates kolme punktiga ikoonist avanevast allalaadimise nupust **„Laadi alla valmis tõlge“**. 

Enne valmis tõlke alla laadimist veendu, et kõik segmendid on tõlgitud (edenemise riba on jõudnud 100%-ni) ja lahendatud on kõik QA probleemid.
Kui tõlkimisesse saadeti DOCX-fail, siis laaditakse alla tõlgitud DOCX-fail jne. Kui lähtefaile oli rohkem kui üks, siis laaditakse need kõik alla pakitud zip-kaustana. St ülesandest ei ole võimalik üksikuid faile eraldi alla laadida. Saab alla laadida kõik failid korraga.

[END]

[START]

## Asutuse andmete haldamine

**Asutuse andmete haldamine**  

Asutuse andmetes saab muuta järgmisi üldandmeid: asutuse nimetus, asutuse lühend, üldine meiliaadress, telefoninumber. Soovitame lisada siia kontaktandmed, millelt tellija seoses päringute ja tellimustega ühendust saab võtta.   

**Tööajad ja puhkepäevad**  

Asutuse andmetes saab määrata ja muuta asutuse tööaegu ja puhkepäevi. Asutuse tööajad ja puhkepäevad määratakse vaikimisi ka kõikidele asutuse kasutajatele. Soovi korral saab kasutaja andmete all neid muuta, kui need erinevad asutuse omadest.  

**Üksused**  

Välisel teostajal puuduvad üksused.  

**Auditlogi sätted**  

Vaikimisi säilitatakse Tõlkevärava auditlogisid süsteemis 730 päeva.

**Azure OpenAI sätted** 

Keeletööriistade lehel saab Tõlkevärava kasutaja masintõlkida teksti või faili. Süsteemi saab lisada Azure OpenAI (Copilot) (Microsofti suur keelemudel; asutusepõhine litsents) litsentsi. Copiloti kasutamiseks tuleb asutuse peakasutajal Azure OpenAI API võti Tõlkeväravasse lisada.

[END]

[START]

## Auditlogid

Logide kuvamiseks ja .csv faili eksportimiseks tuleb määrata parameetrid, mille kohta andmeid otsitakse.  
Logisid säilitatakse 731 päeva.

[BREAK]

[END]`

export default translationAgencyManualText
