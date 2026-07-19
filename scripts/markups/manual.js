const manualText = `# Kasutusjuhend

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



**Aktiveerimine/arhiveerimine**

Konto deaktiveerimisel kasutaja juurdepääsuõigused peatatakse ja tema roll(id) võetakse ära. See sobib kasutaja juurdepääsu ajutiseks peatamiseks. Kui pole soovi kontot hiljem taas aktiveerida, siis tuleks kasutaja konto arhiveerida.  
Kui kasutaja konto deaktiveeritakse ja kasutaja pole ise oma poolikuid töid kolleegidele suunanud, siis on vaid vastavate õigustega kasutajal juurdepääs tema poolikutele tellimustele, alamtellimustele ja ülesannetele. Dekativeeritud konto aktiveerimiseks tuleb klõpsata nupule „Aktiveeri konto“ ja kontole määrata rollid. Kasutaja juurdepääs taastatakse ja ta näeb endaga seotud tellimuste, alamtellimuste või ülesannete ajalugu, kui tema uus roll seda lubab.  
Aktiveeritud/deaktiveeritud kasutajale ei saa uut kontot samas asutuses luua. Arhiveeritud kasutajaga seotud isikukoodile saab uue konto luua: süsteemis luuakse uue unikaalse identifikaatoriga konto, mis on kasutaja isikukoodiga seotud ja sellega seotakse ka kõik uued tellimused (vana kontoga seotud tellimusi selle kontoga ei seota).

[END]

[START]
## Kasutajate lisamine

Kasutaja lisamiseks süsteemi tuleb importida kasutaja andmed CSV-failiga. Laadi faili mall alla siit ([kasutajad_utf.csv](https://github.com/keeleinstituut/tv-tolkevarav/files/15483853/kasutajad_utf.csv)). Kasutaja(te) lisamine töötab vaid selle malliga.
Kasutaja konto loomiseks tuleb failis kasutaja(te) andmetega täita vajalikud andmeväljad. Pärast faili üleslaadimist tuleb kontrollida, et kõik andmed oleksid korrektsed ja vajadusel parandada vead. Kui kõik andmed on korrektsed, siis klõpsa „Salvesta ja saada teavitused“ nupule. Seejärel saavad kõik uued kasutajad teate, et neile on loodud konto Tõlkeväravas.

[BREAK]

Soovitus: igal asutusel peaks olema vähemalt kaks asutuse peakasutajat.

[END]

[START]

## Rollihaldus

Soovitame Tõlkeväravasse luua järgmised rollid:  
* tellija;    
* teostaja;  
* tõlkekorraldaja;  
* asutuse peakasutaja.  

[BREAK]

Iga asutuse peakasutaja saab luua uusi rolle, rolle kustutada ja ümber nimetada. Asutuse rollidele antud privileege saab muuta vaid asutuse peakasutaja. Rollide arv, nendega seotud privileegid ja rollide nimetused võivad erineda sõltuvalt asutuse vajadustest.

[BREAK]

Rollide haldamisega seotud privileegid:  
* „Rollihalduse tabeli vaatamine“ – lubab rollide tabelit vaid vaadata;  
* „Rolli lisamine süsteemi“ – lubab rollide tabelise lisada juurde uusi rolle;  
* „Rolli muutmine (privileegide lisamine/ eemaldamine)“ – lubab olemasolevate rollide privileege muuta;  
* „Rolli kustutamine“ – lubab olemasolevaid rolle kustutada.  

[BREAK]

Link rollide seadistamise näidisele, mis aitab rolle luua ja seadistada: [Rollide-privileegide-tabel_10.04.2026.xlsx](https://github.com/user-attachments/files/26626699/Rollide-privileegide-tabel_10.04.2026.xlsx)
Märkus. Igale kasutajale tuleb määrata ainult üks roll. See välistab olukorra, kus ühele kasutajale määratud erinevate privileegidega rollid sattuvad teineteisega vastuollu.



[END]

[START]

## Tellimused

Tellimuste lehel kuvatakse kõiki sisseloginud kasutajaga seotud tellimusi.
Kui kasutajale on antud õigus näha ka asutuse teisi tellimusi, siis saab eemaldada linnukese valikust „Soovin näha vaid oma tellimusi“ ja seejärel kuvatakse kõiki tellimusi.
Lisaks saab tellimusi filtreerida tellimuse ID, viitenumbri, keelesuuna, tüübi, siltide, staatuse, maksumuse, tähtaja, loomisaja, algusaja ja tellija järgi.

[BREAK]

**Tellimuste staatused**  
- Uus – tellija loodud uus tellimus  
- Registreeritud – tõlkekorraldajale töösse registreeritud tellimus  
- Tühistatud – tühistatud tellimus  
- Tellijale edastatud – tellijale saadetud valmis tellimus  
- Tagasi lükatud – tellija poolt tagasi lükatud valmis tellimus  
- Parandatud – tellijale saadetud parandatud valmis tellimus  
- Vastu võetud – tellija poolt vastu võetud valmis tellimus

[END]

[START]

## Tellimuse lisamine

Tellimuse lisamisel on oluline määrata tellimusele järgmised parameetrid.
 - Määrata **tellija**. See on isik, kelle nimele tellimus vormsitatakse ja kellele valmis tellimus tagasi saadetakse.
 - Määrata tõlkekorraldaja, kellele tellimus suunatakse. Selle välja võib ka tühjaks jätta. Teatud juhtudel ei saa tõlkekorraldajat valida, sest see võimalus on tellija jaoks süsteemi poolt keelatud.
 - Määrata **tellimuse tüüp**. See on teenus, mida soovitakse tellida. Tellimuse tüüpi ei saa muuta pärast tellimuse loomist.
 - Määrata tellimuse sisule vastav **valdkond**.
 - Määrata tellimusele soovitud **valmimise aeg**.
 - Kirjutada tõlkekorraldajale tellimuse erijuhised (näiteks info tõlke vormistamise ja kasutatava sõnavara kohta või muud vajalikud juhised).
 - Sisestada viitenumber (andmereale võib märkida tellimuse nimetuse, numbri, töö sisule viitava info vms).
 - Määrata **lähtekeel ja sihtkeel(ed)**. Valitud keeli ei saa muuta pärast tellimuse loomist.
 - Lisada tõlgitav(ad) fail(id).
 - Lisada soovi korral abifail(id) ja määra nendele tüüp (abifail, stiilijuhis või terminibaas). Abifail on materjal, mis võib tellimuse teostamisel olla vajalik (nt varasemad tõlked, lähtefailiga seotud dokumendid või muu taustamaterjal).

Osasid tellimuse parameetreid ja faile saab hiljem tõlkekorraldaja vajadusel muuta ja täiendada.

[BREAK]

Tellimusega seotud üksikasjad.

**1. Tellimuse tüüp**  
Tellimuse tüüpide loetelus on valik teenustest, mida saab tellida. Sõltuvalt valitud tellimuse tüübist seadistatakse tellimusele soovitud töövoog. Tellimuse tüübi lühendit kasutatakse osana tellimuse ID genereerimisel. Loetelu teenuse tüüpidest ja nende lühenditest:  
- Suuline tõlge – S  
- Järeltõlge – JÄ  
- Sünkroontõlge – SÜ  
- Viipekeel – VK  
- Tõlkimine(CAT), Ülevaatus – T  
- Tõlkimine(CAT) – T  
- Tõlkimine, Ülevaatus – T  
- Tõlkimine – T  
- Toimetamine, Ülevaatus – TO  
- Toimetamine – TO  
- Toimetatud tõlge, Ülevaatus – TO  
- Toimetatud tõlge – TT  
- Tõlkimine(CAT), Toimetamine, Ülevaatus – TT  
- Tõlkimine(CAT), Toimetamine – TT  
- Tõlkimine, Toimetamine, Ülevaatus – TT  
- Tõlkimine, Toimetamine – TT  
- Käsikirjaline tõlge, Ülevaatus – KT  
- Käsikirjaline tõlge – KT  
- Terminoloogia töö – TR  
- Vandetõlge (CAT), Ülevaatus – VT  
- Vandetõlge (CAT) – VT  
- Vandetõlge, Ülevaatus – VT  
- Vandetõlge – VT

[BREAK]

Märkus. Sulgudes **lühend CAT** tellimuse tüübi nimes viitab sellele, et teenuse osaks on kirjalik tõlkimine kasutades tõlketööriista (mh tõlkemälud, terminibaasid ja masintõlge). Ilma CAT lühendita tellimuse tüübid on tõlketööriistata tellimused ja nende puhul ei saa kirjalikku tõlketellimust tõlketööriistas tõlkida, sest CAT lühendita tellimuse tüüpidele ei ole tõlketööriista liidestatud. 


**2. Valdkond**  
Valdkondi kasutatakse Tõlkeväravas nii tellimuste all kui ka tõlkemälude all. Valdkonda saab määrata tellimustele ja tõlkemäludele. Loetelu valdkondadest ja nende lühenditest:  
- Arhiivindus – ARH  
- Avalik kord ja sisejulgeolek – ASP  
- Eelarvepoliitika – EAP  
- Finants– ja kindlustuspoliitika – FKP  
- Haridus – HAR  
- Justiitshalduspoliitika – JHP  
- Kinnisvara– ja osaluspoliitika – KOP  
- Kodakondsuse, rände ja identiteedihaldus – KRI  
- Kriisireguleerimine ja päästetööd – KPT  
- Kriminaalpoliitika – KRP  
- Maksu– ja tollipoliitika – MTP  
- Noorte– ja keelepoliitika – NKP  
- Õiguspoliitika – ÕIP  
- Piirivalve – PRV  
- Rahvastiku– ja perepoliitika – RPP  
- Riigiraamatupidamine – RRP  
- Riiklik statistika – RST  
- Seadusetõlked – SET  
- Teadus – TEA  

[BREAK]
**3. Tähtaeg**  
Tähtaeg viitab tellimusele määratud valmimise ajale.
Suulise tõlke puhul saab tellimusele määrata algusaja ja tähtaja.

**4. Erijuhised tellimuse kohta**  
Igale tellimusele võib kaasa panna ka juhiseid. Need on mõeldud tõlkekorraldajale, tõlkijale/tõlgile ja/või toimetajatele. 

**5. Viitenumber**  
Tellimuse viitenumbri reale saab sisestada tellimuse nimetuse või numbri, mille järgi saab tellimust hiljem süsteemis sortida. Sõltuvalt asutusest võib viitenumbri lisamise süsteem ja kord erineda.

**6. Lähtekeel**  
Valida saab ühe lähtekeele. Kui soovitakse tõlkida mitmest lähtekeelest, siis tuleks luua eraldi tellimused. Pärast tellimuse loomist ei saa lähtekeelt muuta.

**7. Sihtkeel**  
Valida saab ühe või mitu sihtkeelt. Iga keele kohta luuakse tellimuse alla eraldi keelepaaripõhine alamtellimus. Pärast tellimuse loomist ei saa keelevalikut muuta.

**8. Lähtefailid**  
Kirjaliku tellimuse puhul saab lisada järgmisi faililaienditega dokumente: .pdf, .doc, .docx, .odt.xls, .xlsx (all formats).png, .rtf, .odt, .ods, .txt, .html, .xml, .csv, .asice, ja .bdoc. Tõlkeväravas töötab tekstituvastus vaid teatud tüüpi masinloetavate failide peal (nt .docx, .xlsx, .txt jms).
Dokumentide tõlkimiseks, mille faililaiend on .pdf, .jpg, .eml, .png vms, peab tõlkekorraldaja/tõlketeenuse osutaja tekstifail tõlkimiseks ise ette valmistama ja vormistama. Neid ei saa otse tõlketööriista importida.

**9. Abifailid**  
Tellimusega saab kaasa panna mistahes abimaterjale. Abifailile saab määrata soovi korral ka tüübi: abifail, stiilijuhis või terminibaas. Sõltuvalt asutusest võib abifailide kaasa lisamise kord ja vajadus erineda.
Igal asutusel võib olla kasutusel erinev tööde tellimise kord. Soovitame luua asutusesiseselt enda vajadusele sobiva tellimise süsteemi. 

[END]

[START]

## Alamtellimused

Alamtellimuste lehel kuvatakse kõiki sisseloginud kasutajaga seotud tellimuste alamtellimusi.
Kui kasutajale on antud juurdepääs, et näha ka asutuse teisi alamtellimusi, siis saab eemaldada linnukese valikust „Soovin näha vaid oma tellimusi“ ja kuvatakse kõiki alamtellimusi.
Lisaks saab alamtellimusi filtreerida ID, viitenumbri, keelesuuna, tüübi, siltide, staatuse, maksumuse, tähtaja, loomisaja, algusaja ja tellija järgi.

[BREAK]

**Alamtellimuste staatused**  
- Uus – tellija loodud uus tellimus  
- Registreeritud – tõlkekorraldajale töösse registreeritud tellimus  
- Teostajale edastatud (ülesanne) – alamtellimuse ülesanne on saadetud teostajale ootel ülesannete alla 
- Teostamisel (ülesanne) – alamtellimuse ülesanne on saadetud teostajale ja see on tema poolt töösse võetud  
- Teostatud (ülesanne) – alamtellimuse ülesanne on teostaja poolt lõpetatuks märgitud  
- Teostatud – kõik alamtellimuse ülesanded on lõpetatuks märgitud  
- Tühistatud – tellija või tõlkekorraldaja poolt tühistatud tellimus  
- Tellijale edastatud – tellijale saadetud valmis tellimus  
- Tagasi lükatud – tellija poolt tagasi lükatud valmis tellimus  
- Parandatud – tellijale uuesti saadetud muudatustega valmis tellimus  
- Vastu võetud – tellija poolt vastu võetud valmis tellimus

[END]

[START]

## Minu ülesanded

Minu ülesannete lehel kuvatakse kõiki sisseloginud kasutajaga seotud ülesandeid. Võimalik on vaadata aktiivseid ja ootel ülesandeid ning teostatud ülesannete ajalugu. Lisaks saab ülesandeid filtreerida ID, viite, keelesuuna, maksumuse, tüübi, siltide, tähtaja, loomisaja, algusaja ja tellija järgi.

[END]

[START]

## Päringud

Päringuid kuvatakse väliste teostajate kasutajatele, kellele on tema asutuse sätetest lisatud privileegid „Päringute vaatamine“ ja „Päringutele vastamine“. Väline teostaja saab lehel „Päringud“ hallata kõiki tema asutusele saadetud päringuid.  

Päringuid saab filtreerida staatuse järgi (ootel, aktsepteeritud, vastatud, keeldutud, pakkumus tagasi lükatud ja aegunud) ja otsida ülesande ID, tellija, töö tüübi, keelesuuna või päringule vastamise tähtaja järgi.  

Päringule klõpsates avaneb selle detailvaade, kus on näha tellija kontaktandmed, erijuhised, tellimuse andmed (tellimuse tüüp, valdkond, tellimuse tähtaeg, keelesuunad, maht, lähtefailid jms). Kasutaja saab detailvaatest päringule vastata: vajadusel sisestada hinna, lisada kommentaari ja päringu kas vastu võtta või sellest keelduda. Vastuse esitamisel saadetakse päringu saatnud tellijale selle kohta automaatne teavitus.  

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
* **„Keeldu“**: päringu staatuseks määratakse „Keeldutud“. Süsteem palub enne keeldumise kinnitamist lisada kommentaari. Pärast keeldumist ei saa väline teostaja päringut enam muuta ega sellele vastata ja jagatud failid pole enam kättesaadavad.
* **„Võta päring vastu“**: süsteem saadab tellijale vastava teavituse ning kasutajale kuvatakse teade „Päring on vastu võetud ja edastatud tellijale ülevaatamiseks“.  
* Kui teostaja ei jõua reageerimisaja jooksul vastata, määrab süsteem päringu staatuseks automaatselt **„Aegunud“** ja päring suletakse.
Keeldumise, vastuvõtmise ja aegumise kohta saadetakse tellijale automaatteade meili teel.  

[END]

[START]

## Tellimuse detailid

Tellimuse detailide all kuvatakse tellimuse üldandmeid, alamtellimuste andmeid ja tellimuse lähte-ja valmisfaile.
Pärast tellimuse loomist, ei saa tellimuse detailandmetes muuta tellimuse tüüpi, lähtekeelt ja sihtkeelt. Pärast tellimuse loomist saab tellimuse detailandmete all teha muudatusi viitenumbri ja erijuhiste väljal ning muuta tellimuse valdkonda, tähtaega, silte ja failide loendit.
Tellimusega seotud alamtellimusi saab töösse saata tõlkekorraldaja (kasutaja, kellel on privileegid „Tõlketellimuse korraldamine“ ja „Päringute haldamine“).

[BREAK]

**Tellimuse detailide muutmine**

Tõlkekorraldaja rolliga (või privileegiga „Tõlketellimuse korraldamine“) kasutaja saab tellimust ja sellega seotud alamtellimust hallata.

**Tellimuse üldandmete muutmine**

Enne tellimuse töösse suunamist tuleks kontrollida tellimuse üldandmeid. Soovi korral saab tõlkekorraldaja tellimuse üldandmetes teha järgmisi muudatusi.
* Muuta tellijat.
* Muuta tõlkekorraldajat.
* Kustutada/lisada lähtefaile.
* Kustutada/lisada abifaile.
* Muuta tellimuse tähtaega või algus-ja lõpuaega.
* Muuta tellimuse viitenumbrit (so kokkulepitud viis tellimusi nimetada/nummerdada).
* Lisada tellimusele asutusepõhiseid silte.
* Muuta tellimuse valdkonda.
Tellimuse üldandmetes valitud tellimuse tüüp määrab alamtellimuse all kasutatava töövoo (näiteks suulise ja kirjaliku teenuse töövood on erinevate eelseadistustega). Tellimuse tüüpi ja keeli ei saa muuta pärast tellimuse loomist. Kui tellimus on loodud vale tellimuse tüübi või keelesuunaga, siis tuleks tellimus tühistada ja luua uus tellimus korrektse tellimuse tüübi ja keeltega.

**Alamtellimuse haldamine ja üldandmete muutmine**

Alamtellimus(ed) luuakse tellimuse üldandmetes määratud tellimuse tüübi järgi ning üldandmetesse lisatud lähtekeele ja sihtkeel(t)ega. Sõltuvalt valitud teenuse tüübist saab tõlkekorraldaja alamtellimuse all teha järgmist.
* Määrata ja muuta alamtellimuse all olevate ülesannete tähtaegasid või algus-ja lõpuaegasid.
* Kustutada/lisada faile.
* Lisada teostajatele ülesannete alla erijuhiseid.
* CAT-liidestusega tellimuse tüübiga tööde puhul lisada alamtellimusele tõlkemälud, saata tõlgitav tekst tõlkimiseks tõlketööriista ja teha tõlkemahuanalüüsi.
* Lisada ülesannetele töömahtu ja töötasu (käsitsi või tõlkemahuanalüüsi järgi).
* Saata ülesandeid andmebaasidesse lisatud teostajatele. Majasisesed teostajad (tõlkijad, tõlgid ja toimetajad) avanevad nupust „Lisa andmebaasist“ ja välispartnerid (tõlkebürood, teised riigiasutused jms) nupust „Koosta päring“.
* Teostajate valmis tööfaile alla laadida, kontrollida ja tellijale suunata. Seda sammu saab ka vahele jätta: sõltuvalt tellimuse tüübi sätetest saadab süsteem teostajate valmisfailid otse tellijale. Tellimuse tüüp, mille nimes on „ülevaatus“ (nt „Tõlkimine, Ülevaatus“), on mõeldud selleks, et teostaja poolt süsteemi üles laaditud valmisfailid saaks tõlkekorraldaja enne tellijaga jagamist ise üle vaadata ja väljastuseelse kontrolli teha. Lisaks saab tõlkekorraldaja valida, milliseid faile tellijaga jagada. Selleks on loodud valmisfailide loendisse märkeruut „Tellijaga jagatud“, mis võimaldab vaid valitud valmis tööfaile tellijaga jagada.

**Päringu saatmine välistele teostajatele**  

Kui alamtellimuse ülesandele ei ole määratud ühtegi asutusesisest teostajat, saab tõlkekorraldaja saata ülesande kohta päringu välistele teostajatele (nt teistele avaliku sektori asutustele või tõlkebüroodele). Selleks tuleb navigeerida alamtellimuse ülesande lehele (nt „Tõlkimine“) ja klõpsata nupule **„Koosta päring“**, mis asub majasiseste teostajate lisamise nupu „Lisa andmebaasist“ kõrval.  

Nupp „Koosta päring“ on aktiivne vaid siis, kui ülesandele ei ole veel ühtegi asutusesisest teostajat määratud ja kasutajal on privileeg „Päringute haldamine“. Isegi kui soovitakse saata üks päring terve tellimuse (kõikide alamtellimuste ja nende ülesannete) kohta, tuleb siiski päringud koostada iga alamtellimuse ülesande all eraldi.  

**Päringu koostamise võimalused**  

* Päringu saatmise vorm avaneb nupust **„Koosta päring“**. Seejärel saab valida nimekirjast välised teostajad, kellele soovitakse päring saata. Nimekirjas kuvatakse kõik välised teostajad, kes on lisatud asutuse **väliste teostajate andmebaasi**. Valida saab ühe või mitu välist teostajat.
* Päringule saab määrata vastamise tähtaja (kuupäev ja kellaaeg). Kuupäeva valimine ei ole kohustuslik.
* Päringu saab saata **kõigile korraga või kaskaad-režiimis**.
* Kaskaadmeetodi kasutamiseks tuleb teostajad panna järjekorda. Eespool olevad teostajad saavad päringu esimesena.
* Kaskaad-režiimis saab määrata **reageerimisaja**: 15, 30, 60, 120, 180 või 240 minutit. Reageerimisaja loendus algab päringu väljasaatmisel ja peatub, kui üks teostajatest on päringu vastu võtnud. Kui päring lükatakse tagasi või päring aegub, saadetakse päring automaatselt järgmisele nimekirjas olevale teostajale.
* Väljale „Erijuhised päringu kohta“ saab lisada vabas vormis teksti, mida kuvatakse kõikidele teostajatele.
* Tellimuses sisalduvaid faile saab päringuga kaasa saata (st neid saab jagada päringu saanud väliste teostajatega). Vajadusel saab laadida päringu juurde ka täiendavaid faile (need võivad olla erinevad tellimuse failidest).
* Lisaks tuleb valida rippmenüüst „Vali hinnastamise mudel“, mille põhjal päringu maksumust kalkuleeritakse või küsitakse.
* Pärast hinnastamise mudeli valimist kuvatakse ülevaatlikku kokkuvõtet ja valitud väliste teostajate loetelu koos nende hinnakirjajärgsete hindadega (kui need on määratud/valitud). Kaskaad-režiimi puhul saab vajadusel teostajate järjekorda muuta.
* Kui kõik andmed on korrektsed, võib päringu nupust „Saada päring“ välja saata. Süsteem saadab päringu kohta teostajatele meilid ja päring avaldatakse väliste teostajate süsteemis jaotises „Päringud“.

**Päringul on kolm hinnastamise mudelit**  

* **„Teostajapõhine hinnastamine“**: hind arvutatakse valitud teostaja hinnakirja alusel (teostajate hinnakirju saab vaadata/redigeerida menüü „Välised teostajad“ kaudu). Kui sisestada ühik ja ühiku maksumus käsitsi, siis rakendub see vaid nendele välistele teostajatele, kellel vastava keelesuuna ja oskuse hind andmebaasis puudub; teiste teostajate hindu see ei muuda, sest nendele arvutatakse kogumaksumus automaatselt hinnakirja alusel (nt kui sisestada mahuks 1 lehekülg ja välise teostaja A hinnakirjas on lehekülje hind 15,00€ ja välise teostaja B hinnakirjas on lehekülje hind 18,00€, siis kalkuleerib süsteem välise teostaja A päringu alla hinnaks 15,00€ ja välise teostaja B päringu alla hinnaks 18,00€). Erand: kui ülesandele on maht lisatud tõlkemahuanalüüsi järgi, kuid välisel teostajal hinnakirjas vastav oskus ja keelesuund puudub, siis automaatset hinnaarvestust süsteem teha ei oska.
* **„Fikseeritud hind“**: tellija saab märkida tööle  hinna. See hind kehtib kõikide teostajatele, kellele päring saadetakse ja tühistab nendega kokku lepitud hinnakirjas oleva hinna (automaaset arvutust hinnakirja ühikuhinnaga ei toimu). Seda hinnastamise mudelit saab kasutada näiteks siis, kui hind on juba Tõlkeväravast väljaspool kokku lepitud või pakutava teenuse täpne maksumus on juba ette teada.
* **„Küsi hinda“**: teostajatega jagatakse vaid ülesande mahtu, millele teostaja saab  ise oma hinda pakkuda (nt päringu maht on märgitud 50 lehekülge ja päringu vastuses saab iga väline teostada sisestada, kui suur on sellise töö tasu).  

**Mis olukorras milline hinnastamise mudel valida?**  
* Teostajapõhine hinnastamine arvutab maksumuse automaatselt teostaja hinnakirja alusel. Eelistada seda siis, kui kõikidel välistel teostajatel on hankelepinguga hinnakiri fikseeritud ja see on Tõlkeväravasse sisestatud.
* Fikseeritud hind lubab tellijal ise määrata tööle kindla kogusumma, millega seda pakutakse kõigile päringu saajatele. See tühistab teostajapõhise hinnaarvestuse ja sobib hästi, kui tellimuse eelarve on paigas või hind on juba eelnevalt (nt väljaspool Tõlkeväravat) kokku lepitud.
* Hinna küsimise puhul kuvatakse päringu saajatele vaid mahuarvestust ja nad saavad esitada tööle oma hinnapakkumise. See on ideaalne lahendus suuremate eritööde tellimiseks, minikonkursside tegemiseks, lepinguga reguleerimata teenuste/keelte ostmiseks ja ka pakkumiste võrdlemiseks.  


**Päringute jälgimine ja tellimuseks vormistamine**  

Saadetud päringut kuvatakse alamtellimuse ülesande lehel jaotises **„Päringud välistele teostajatele“**. Iga päringu detailvaates kuvatakse päringu saajad ja staatused. Kõiki päringu saajaid teavitatakse uuest päringust meili teel, et nad Tõlkeväravasse sisse logiksid ja vastaksid.  

**Päringu staatused**
* Ootel: päring on saadetud ja vastuse ootel
* Saatmise ootel: päring on saatmise ootel (nt kaskaad-režiimi puhul)
* Vastatud: teostaja on päringu vastu võtnud
* Keeldutud: teostaja on päringust keeldunud
* Aegunud: vastamise aeg on möödas ja päringule ei vastatud
* Tühistatud: tõlkekorraldaja on päringu tühistanud
* Aktsepteeritud: päring on tellimuseks vormistatud
* Pakkumus tagasi lükatud: pakkumus ei osutunud valituks  

Pärast päringule vastuste saamist saab päringu sobivale teostajale tellimuseks kinnitada nupust **„Vali võitja“**. Seejärel saab võitnud väline teostaja meiliteate, et tellimus on talle määratud. Teised teostajad saavad teate põhjendusega, miks nad valituks ei osutunud. Põhjenduse saab lisada vabatekstiväljale. Väli on eeltäidetud tekstiga „Konkureeriva partneri pakkumus osutus valituks“ ja seda saab muuta. 

Sellega on päringu etapp lõppenud ja **edasine tellimuse haldamine toimub tavapärase tellimuse korraldamise loogika järgi**. Ülesande jaotisesse „Teostajad“ ilmub info valitud teostaja kohta kohe pärast seda, kui väline teostaja (nt tõlkebüroo tõlkekorraldaja) on ülesandele teostaja (tõlkebüroo tõlgi, tõlkija või toimetaja) määranud. Tellija asutuse tõlkekorraldaja peab alamtellimuse ülesandeid jagama ka teostajatega: **ülesannete alla lisatud failide ja ülesande jagamine toimub nupust „Jaga alamtellimus“**. 
Vajutades nuppu „Jaga alamtellimus“, käivitatakse alamtellimuse töövoog ja tehakse alamtellimus Tõlkeväravas nähtavaks ka määratud teostajatele. Kui pole tehtud alamtellimuse jagamise sammu, siis **ei näe** teostajad Tõlkeväravas seda alamtellimuse ülesannet **endale määratud ootel ülesannete loetelus**. **Alamtellimuse staatus peab olema „Teostajale saadetud“** ja kui teostaja selle kättesaamist kinnitab, liigub töö edasi staatusesse **„Teostamisel“**. Kui seda mitte teha ei saa teostaja ülesandega alustada.

**Tellimuse failide jagamine välise teostaja tõlkijaga/toimetajaga**  

Kui väline teostaja on päringu vastu võtnud ja tellija on talle tellimuse töösse kinnitanud (nupust „Vali võitja“), peab välise teostaja tõlkekorraldaja ülesandele määrama teostajad. Esmalt saab väline teostaja teavituse pealkirjaga „Tellimus määratud“ ja seejärel saab ta tellimuse enda Tõlkevärava keskkonnas avada ja määrata ülesandele oma asutusesisese teostaja nupust „Lisa andmebaasist“ (nt enda tõlkebüroo tõlkijate seast valida ja määrata sobiva vaba lingvisti).  Tellija asutuse tõlkekorraldaja peab seepärast alamtellimuse ülesandeid jagama alati ka teostajatega: ülesannete alla lisatud **failide ja ülesande jagamine toimub vaid nupust „Jaga alamtellimus“**. Ainult tellija asutuse tõlkekorraldaja saab ülesande teostajale nähtavaks teha. 

**Oluline teada päringute tegemisel välistele partnertitele**  
* Tellimusele pääseb ligi ainult see väline teostaja, kellele tellimus on määratud ja teised päringu saajad tellimust ei näe.
* Väline teostaja ei näe tellimuse juures ka teiste väliste teostajate nimekirja ega saa ise samale tellimusele päringuid koostada.
* Tellimuse ja alamtellimuse staatuse muutumise kohta saadab süsteem teate kõigile tellimuse küljes olevalte tellijale ja tõlkekorraldajale.
* Kui tellija on tellimuse üle vaadanud ja vastu võtnud, siis ei saa väline teostaja enam tellimust ega sellega seotud faile muuta ega alla/üles laadida.

[END]

[START]

## Tellimuse tühistamine

Tellimust saab tühistada tellimuse vaates klõpsates nuppu „Tühista tellimus“. 
Kui tellimus on tühistamise hetkel juba teostamisel, siis võib tekkida vajadus pooliku töö eest teostaja(te)le tasuda. Tühistamisel tuleks märkida ka tühistamise põhjus ja klõpsata „Jah, tühista“. Tühistatud tellimus tähistatakse staatusega „Tühistatud“. Teade tühistamise kohta koos tühistamise põhjendusega saadetakse tõlkekorraldajale ja tellijale, kes on tellimuse all määratud tellijaks/tõlkekorraldajaks. Sama töö uuesti tellimiseks tuleb luua uus tellimus.

[END]
[START]

## Tellimuse vastuvõtmine (tellija)

Kui tellimus on valmis (st tellimuse saatus on „Edastatud“ ja alamtellimuse staatus on „Teostatud“), siis saab tellija selle kohta Tõlkeväravast teate pealkirjaga „Tellimus vastuvõtmiseks valmis“. Valmisfaili(d) saab alla laadida tellimusega seotud alamtellimuse all „Valmisfailid teostajatelt“ tulbast. Lisaks on vaja tellimus heaks kiita klõpsates nupule „Võta vastu“. Seejärel on tellimus lõplikult valmis ja sellega seotud alamtellimused ja ülesanded suletakse. Tellimus saab staatuse „Vastuvõetud“ ja alamtellimusele jääb staatus „Teostatud“.

Kui tellija soovib tellimuse tõlkekorraldajale/tõlkijale/toimetajale tagasi saata, siis saab tellimuse tagasi lükata klõpsates nupule „Lükka tagasi“. Seejärel tuleb valida alamtellimus(ed), mida soovitakse tagasi lükata. Hea oleks juurde lisada ka lühike tagasilükkamise põhjendus ja kirjeldus, mida on vaja teisiti teha. Juhul kui tellijal on kaasa panna alamtellimusega seotud tagasisidefail, siis saab ka selle juurde lisada.

Tellimuse tagasilükkamise teade saadetakse tõlkekorraldajale. Vajadusel võtab tõlkekorraldaja tellijaga eraldi ühendust. Kui tellimust on vastavalt tellija tagasisidele muudetud ja see on valmis, siis saadetakse tellijale uuesti teade pealkirjaga „Tellimus vastuvõtmiseks valmis“. Tellimus loetakse lõpetatuks ning sellega seotud alamtellimused ja ülesanded suletakse kui see vastu võetakse.

[END]

[START]

## Kalender

**Kalender**

Kalender on mõeldud suuliste tõlketööde tellimiseks ja asutuse suuliste tõlkide tööaja korraldamiseks. Kalendri moodul sobib asutusele, kus on paju suulist tõlketööd ja tellimuste ning tõlkide tööaja haldamine on ajamahukas.  

Kalendris saab vastavate privileegidega kasutaja teha järgmist.
* Tellija saab sisestada tellimusi ja vaadata endaga seotud tellimusi.
* Tõlkekorraldaja saab sisestada tellimusi, vaadata sisestatud tellimusi ja tellimusi korraldada.
* Teostaja saab tellimusi vastu võtta, vaadata endaga seotud tellimusi ning oma töökalendrit koos hõivatud ja vabade aegadega süsteemi importida.  
  
Kalendri mooduli seadistamine ei ole vajalik asutustes, kus suulist tõlketeenust ostetakse harva. Muud suulist tõlketeenust (nt järeltõlget ja sünkroontõlget) saab tellida tavalise tellimusvormi kaudu kalendriväliselt („Tellimused“ -> „Lisa tellimus“). 

Kalendri lehel on alamtellimuste staatustel järgmine tähendus:   
„Teostajale edastatud“ ülesande tööpäring on teostajale saadetud;   
„Teostamisel“ ülesanne on teostaja poolt vastuvõetud;   
„Teostatud“ ülesanne on teostatud ja töö on lõppenud.   

[BREAK]

**Kalendri seadistamine**  

Kalendri funktsionaalsuste kasutamiseks tuleb kalender seadistada vastavalt asutuse vajadustele. Kalendrit ei saa seadistamiseta kasutada.

* Kalendri sätete all tuleb määrata asutuses tellitavad suulise tõlketeenuse keeled („Asutuse sätted“ -> **„Kalendri sätted“** -> „Muuda“ -> „Kalendri keeled“). Asutuse kalendri jaoks seadistatud keeled on need keeled, mida kuvatakse kalendri põhivaates ja neid keeli saab tellida otse kalendrist. Keeli, mida ei ole lisatud kalendri peamiste keelte loetelusse, saab tellida kalendri menüüst „Veel“ > „Lisa Tellimus“. Tellimusvormil saab valida kõiki süsteemi keeli. Puuduva keele saab vajadusel lisada ka kalendri peamiste keelte alla.
* Teostajate andmebaasi lisatud teostajate kontode sätted tuleb seadistada selliselt, et nad saaksid lisaks tavalistele tellimustele ka kalendri kaudu suulise tõlke tellimusi. Kõik teostajad, kellele on määratud hinnakirjas **oskusena** suuline tõlge ja kalendri keeled, ilmuvad kalendri vaatesse ja neile saab kalendrist suulise tõlketellimuse töösse määrata. **Oluline märkus!** Teostaja, kellele on tema sätete alla sisestatud ka „Lepingupartneri ärinimi“, loetakse asutuse väliseks teostajateks ja teda **ei kuvata** kalendris. See andmeväli võimaldab eristada kahte tüüpi teostajat: majasiseseid teostajad (väli „Lepingupartneri ärinimi“ on tühi) ja välised teostajad (väli „Lepingupartneri ärinimi“ on täidetud). Vt lisainfot kasutusjuhendi peatükist „Teostajate andmebaas“. 
* Kalendri broneerimissüsteemi täpse toimimise jaoks on äärmiselt oluline, et iga teostaja impordiks oma isikliku töökalendri Tõlkeväravasse („Minu roll “ -> „Minu andmed“ -> „Impordi kalender“). Kui kalender on imporditud, siis oskab süsteem arvestada aegadega, millal teostaja **pole kättesaadav**, ega paku talle tööd hõivatud aegadel. Kui kõik teostajad oma kalendrit pidevalt ajakohasena hoiavad, siis suudab Tõlkevärav leida kiirelt esimese vaba tõlgi ja aitab tõlkide tööaegu vajaduspõhiselt ümber korraldada.  
* Kui asutuses on vajadus korraldada **kiirtellimusi** ja tõlkidele kiirtöid määrata, siis tuleks teostajatele määrata ka **EMO tööajad**. Need tööajad tuleb määrata vaid nendele teostajale, kes pakuvad suulist kiirtõlget. Selleks, et kalendrisüsteem tuvastaks, kes teostajatest on valmis kiirtellimusi vastu võtma, peab teostajale määrama EMO tööajad (need on kuupäevad, mil ta on valmis kiirtõlkeid tegema). EMO tööaegadele ei määra süsteem tellimusi automaatselt, vaid neid tellimusi määrab tõlkekorraldaja käsitsi. EMO tööaegade funktsionaalsus on loodud selleks, et kalendriga saaks hallata olukordi, mil kõik vabad tööajad on kalendris broneeritud, kuid tellija vajab siiski kiirtõlget. Tõlkekorraldaja kalendri peavaates on EMO-teostajad kollasel taustal.  
  
**Kalendrist suulise tõlketöö tellimine**

* Tellimuse saab esitada lehelt „Kalender“, valides kalendris kuvatava võõrkeele ja vaba aja. 
* Kui kalendris ei ole ühtegi vaba aega, saab kasutaja otsida järgmist vaba aega otsinguribalt. 
* Kui kalender ei kuvata sobivat vaba aega, siis saab kasutaja lisada tellimuse menüüst „Veel“ > „Lisa Tellimus“. Sellest vormist tellimuse lisamisel saab kasutaja valida endale sobiva aja käsitsi. Sellisel juhul tegeleb tõlgi otsimisega tõlkekorraldaja.
* Tellja näeb kõiki oma tellimusi kalendris. Lisainfo saamiseks klõpsata tellimusele ja seejärel kuvatakse tellimuse detailid. 

**Kalendritellimuste korraldamine**

* Tõlkekorraldajale kuvatakse kalendris keeled ja vastavate keelte tõlgid. 
* Tõlkekorraldaja saab muuta tellimuse detaile.
* Kõiki kalendri kaudu tellitud suulise tõlke tellimusi on võimalik vaadata ka tellimuste vaates („Tellimused“ -> „Suulise tõlke tellimused“).


[END]

[START]

## Teostajate andmebaas

Teostajate andmebaasis kuvatakse kõik asutuse kasutajad, kes on teostajate andmebaasi lisatud. Uute teostajate süsteemi lisamiseks või olemasolevate teostajate eemaldamiseks klõpsata menüüst „Teostajate andmebaas“ nupule „Lisa/eemalda teostajaid“.

Teostaja konto andmete vaates saab hallata temaga kokkulepitud hinnakirja ja tõlkemäluanalüüsipõhist soodustuse tabelit. Teostajale saab lisada ka silte ja  kommentaare. Teostaja ise enda kontole lisatud silte ja kommentaare ei näe. Need on mõeldud asutusesiseseks kasutamiseks (eelkõige tõlkekorraldajale). Lisaks saab teostaja andmete alt vaadata temaga seotud aktiivseid ülesandeid (nupust „Vaata teostaja teostamisel ülesandeid“). Kui asutus kasutab suuliste tõlketellimuste jaoks Tõlkevärava kalendrit, siis võib teostajale määrata ka „EMO tööajad“. Need on vajalikud tõlkekorraldajatele kiirtellimuste haldamiseks.

Tõlkevärava kasutajate kontod on seotud kasutaja isikukoodiga ja tema nimega. Teostajate andmebaasi lisatud kasutajatele on võimalik lisada ka „Lepingupartneri ärinimi“. Kui teenust osutab asutuseväline partner (nt FIE, OÜ, vms) ja mitte eraisik või põhikohaga töötaja, siis soovitame teostajale lisada ka ärinime või viite koostöövormile. Kui asutus ostab teenust tõlkebüroolt või muult keeleteenuse pakkujalt, kus töötab enam kui üks inimene, siis soovitame partneri lisada asutuseväliste teostajate andmebaasi („Välised teostajad“ -> „Lisa/eemalda välispartneri konto“). Nii saab asutuseväline teostajast tõlkebüroo oma tõlkekorraldajatele, tõlkijatele ja toimetajatele Tõlkeväravasse ise kontod luua ning tellimusi neile töösse määrata.

[BREAK]

**Teostaja hinnakirja seadistamine**  
Teostaja oskuste ja hindade sisestamiseks tuleb avada tema üldandmete vaade ja menüüst „Hinnakiri“ klõpsata nupule „+ lisa keelesuund“.
1. Esmalt tuleb valida keelepaar, millele soovitakse oskust(teenust) lisada. Valida saab ühe lähtekeele ja ühe või mitu sihtkeelt. Valides rohkem kui ühe sihtkeele, tuleb arvestada, et valitud keeltele saab sisestada ühed ja samad hinnad. Kui soovid igale keelepaarile sisestada erinevad ühikuhinnad, siis tuleb iga keelepaar sisestada eraldi.
2. Järgmiseks saab valitud keelepaarile määrata oskused.
3. Viimaseks saab oskustele määrata ühikupõhised tasud. Juhul, kui mõnda arvestusühikut selle teostaja puhul ei kasutata või puudub kokkulepitud hind, siis võib jätta selle ühiku hinnaks nulli. See ei mõjuta süsteemi kasutamist. 


**Analüüsipõhine soodustus**  
Peamine arvestusühik ja tasuarvestuse kord võib asutustes erineda. Kui teie asutus soovib kirjalike tõlketellimuste jaoks kasutada tõlketööriista (sh kasutada tõlkemälusid ja tõlkemahuanalüüsipõhist soodustust), siis soovitame kõikide teostajatega kokku leppida sõnapõhine ühikuarvestus. Tõlkevärava tõlkemälupõhine tõlkemahuanalüüs ei kalkuleeri ega kuva lähteteksti(de) mahtu ähemärgi- ja leheküljepõhiselt. Tõlkemäluanalüüs arvutab teksti mahtu ja tõlkemälukattuvusi sõnades.

Tõlkemälu kasutamisest ja sellelt hinnasoodustuse arvutamise kohta saab juurde lugeda Tõlkevärava artiklist „Tõlketööde hankimise parimad praktikad ning põhimõtted“: https://github.com/keeleinstituut/tv-wiki/wiki/T%C3%B5lket%C3%B6%C3%B6de-hankimise-parimad-praktikad-ning-p%C3%B5him%C3%B5tted#t%C3%B5lkimisest-%C3%BCldiselt  

**EMO tööajad**  
Need tööajad võib teostajale määrata ainult siis, kui teostaja pakub suulist kiirtõlget ja asutus kasutab tellimuste haldamiseks Tõlkevärava kalendrit. Selleks, et kalendrisüsteem tuvastaks, kes teostajatest on valmis kiirtellimusi vastu võtma, peab esmalt teostajale määrama EMO tööajad (need on kuupäevad, mil ta on valmis kiirtöödeks). EMO tööaegadele ei määra süsteem tellimusi automaatselt, vaid neid tellimusi määrab tõlkekorraldaja käsitsi. Vt lisainfot kasutusjuhendi peatükist „Kalender“.

[END]

[START]

## Väliste teostajate andmebaas

Väliste teostajate andmebaasis kuvatakse kõik **asutusevälised teostajad**, kelleks võivad olla teised Tõlkeväravat kasutavad avaliku sektori asutused, erasektoris tegutsevad tõlkebürood või muud keeleteenuse pakkujad.  

Uue välispartneri lisamiseks või eemaldamiseks klõpsata nupule **„Lisa/eemalda välispartnerid“**. Linnuta välispartner, keda soovid lisada ja klõpsa „Kinnita“. Kui otsitavat välispartnerit nimekirjast ei leia, siis ei ole see asutus veel Tõlkevärava kontot taotlenud.  

[BREAK]

**Välise teostaja hinnakirja seadistamine**  

Välise teostajaga kokku lepitud hinnakirja lisamiseks/muutmiseks klõpsata „Vaata“, et seadistada keelesuunad, oskused, ühikud ja hinnad ning analüüsipõhine soodustus, kui see on ette nähtud (nagu asutusesisese teostaja hinnakirja koostamine (vt juhendit „Teostajate andmebaas“ > „Teostaja hinnakirja seadistamine“)). Sisestatud hindu kasutatakse päringu koostamisel automaatseks hinna kalkuleerimiseks siis, kui hinnastamise mudeliks valitakse „Teostajapõhine hinnastamine“.  

Kui teostajal hinnakirjas mingile teenusele ühikuhinda ei ole lisatud, saab päringu koostamisel valida hinnastamise mudeli „Fikseeritud hind“ (ühekordse kokkuleppehinna saamiseks) või „Küsi hinda“ (teostaja peab hinna ise pakkuma).  

**Väliste teostajate andmebaasi kasutamine**  

Väliste teostajate andmebaasi kasutavad enamasti tõlkekorraldajad (kasutaja privileegiga „Tõlketellimuse korraldamine“ ja „Päringute haldamine“) **päringute koostamiseks**: alamtellimuste all saab väliste teostajate nimekirjast valida ühe või mitu asutust, kellele soovitakse ülesande kohta päring saata. Andmebaasi lisatud teostaja andmed (sh neile loodud hinnakiri) kanduvad automaatselt üle päringu koostamise vaatesse ja ühikuhinnad ei vaja iga päringu puhul uuesti sisestamist. Päringu saatmiseks navigeerida alamtellimuse ülesande lehele (nt „Tõlkimine“ vm) ja klõpsata nupule „Koosta päring“, mis on teostaja lisamise nupu „Lisa andmebaasist“ kõrval.  

[END]

[START]

## Koondhinnakiri
Koondhinnakirja vaates saab filtreerida teostajaid keelte ja oskuste järgi, otsida teostajaid nime järgi ning sortida neid ühikuhinna järgi.

[END]

[START]

## Ülesanded
Ülesannete lehel kuvatakse kõiki sisseloginud kasutajaga seotud aktiivseid ülesandeid.

[END]

[START]

## Tõlkemälud

Tõlkemälude nimekirjas kuvatakse kõiki asutuse siseseid, asutustega jagatud ja avalikke tõlkemälusid. Tõlkemälusid saab filtreerida järgmiste parameetrite järgi: nimetus, sildid, valdkond ja keelesuund.

Tõlkevärava tõlkemälud on kolme erineva kasutuspiiranguga:  
* **„Asutuse sisene“** – tõlkemälu on jagatud ainult asutuse kasutajatega, kelle roll lubab mälusid vaadata, hallata ja/või kasutada;
* **„Asutustega jagamiseks“** – tõlkemälu on jagatud ka teiste avaliku sektori asutuste kasutajatega, kelle roll lubab mälusid vaadata, hallata ja/või kasutada;
* **„Avalik“** – tõlkemälu on jagatud kõikide Tõlkevärava kasutajatega.  

**Tõlkemälu haldamine**  

Tõlkemälu saab redigeerida tõlkemälu omav asutus. Kui asutus ei soovi tõlkemälu teiste asutustega jagada või see sisaldab AK-märkega tekste, siis tuleb määrata kasutuspiiranguks „Asutuse sisene“. Tõlkemälu andmete vaatamiseks ja haldamiseks tuleb klõpsata tõlkemälu nimetusele. Privileegiga **Asutuse tõlkemälu andmete muutmine** kasutaja saab muuta tõlkemälu nime, silte, kasutust, valdkonda, kommentaare ja tõlkemällu salvestatud segmente. 

**Tõlkemällu saab salvestada tõlkeid kahel järgmisel moel**  
* Tõlkemällu saab importida **väljaspool Tõlkeväravat koostatud tõlkemälu**. Selleks tuleb avada tõlkemälu või luua uus tõlkemälu ja tõlkemälu .tmx-fail sellesse importida (nuppust „Impordi .tmx“). 
* Lisades tõlkemälu alamtellimusele „Peamine/Kirjuta“ mäluna, salvestatakse kõik selle **alamtellimuse tõlked valitud tõlkemällu** automaatselt.  

**Tõlkemälu üldandmete** lehel kuvatakse konkreetse tõlkemäluga seotud alamtellimused. Kasutaja saab vaadata, milliste tellimuse tõlked on sellesse tõlkemällu salvestatud. See info aitab teha otsuseid, mis tüüpi tõlketellimustele saab seda tõlkemälu edaspidi „Peamine/Kirjuta“ mäluna lisada.

Asutuse tõlkemälusse salvestatud tõlkesegmentides saab muudatusi teha kasutaja, kellel on privileeg **„Asutuse tõlkemälu andmete muutmine“**. See võib olla vajalik siis, kui tõlkemälus on vaja teha parandusi või uuendada aegunud terminoloogiat/sõnastust. Tõlkemälu redaktor tõlgetest otsingu tegemiseks ja tõlgete muutmiseks avaneb nupust **„Ava tõlkemälu“**.  

[BREAK]  

**Tõlkemälude eksportimine**  
 
Tõlkemälusid saab alla laadida ühekaupa või hulgi. Tõlkemälud laaditakse alla **.tmx-failina**.
* Ükshaaval eksportimist saab teha tõlkemälu detailvaates: avada soovitud mälu ja vajutada nupule „Ekspordi“.
* Hulgi eksportimine on võimalik tõlkemälude koondvaates. Alla saab laadida ühe kindla keelesuuna koondmälu. Eksportimiseks on vajalik keelesuuna filtris valida ainult üks keelesuund (nt „et_en“). Eksportimisel luuakse kõikidest valitud tõlkemäludest üks koondmälu ja see salvestatakse kasutaja arvutisse. **NB!** Süsteem hoiatab kasutajat, kui eksportimiseks on valitud ka mitte-avalikud tõlkemälud. Kasutaja peab kontrollima, et ta tundlikuid andmeid kogemata alla ei laadiks.

**Märkus.** Avaliku ja jagatud kasutuspiiranguga tõlkemälu andmeid kuvatakse kõikidele Tõlkevärava kasutajatele, kelle roll lubab mälusid vaadata, hallata ja/või kasutada. St kasutajatele kuvatakse mälu ID, nimi, valdkond, keelesuund, segmentide arv, loomise aeg ja kommentaar.

**Tõlkemälu segmentide redigeerimine redaktoris**  

Tõlkemälu detailvaates saab privileegiga **„Asutuse tõlkemälu andmete muutmine“** kasutaja klõpsata nuppu **„Ava tõlkemälu“**, mis avab redaktori tõlkemälusse salvestatud tõlgete vaatamiseks ja redigeerimiseks. Avada ja redigeerida saab tõlkemälusid, mis kuuluvad kasutaja asutusele. Teiste asutuste avalikke või jagatud tõlkemälusid avada ja redigeerida ei saa.

Redaktor kuvab tõlkemällu salvestatud tõlkesegmendid kahes veerus: lähtekeel vasakul ja sihtkeel paremal (sarnaselt CAT-tööriistaga). Lehe ülaosas on otsinguväljad, kust saab otsida nii lähte- kui sihtkeele teksti sõnade, fraaside või lausete järgi.  Kui otsingule tulemusi ei leita, ei kuvata kasutajale ühtegi segmenti. Lehe alumises osas kuvatakse alati segmentide arv, mida parasjagu kasutajale välja kuvatakse või filtreeritakse.

* Segmendile klõpsates kuvatakse selle **lisainfo**: tõlkeühiku unikaalne ID tõlkemälus; lähteteksti ja sihtteksti tähemärkide arv; tõlkele eelnenud ja järgnenud segment konteksti andmiseks; tõlkeühiku loomise aeg ja tõlkeühiku viimane uuendamise aeg.
* Redaktoris saab kasutada ka **vormistamise kiirnuppe** (paks, kursiiv, allakriipsutus, ülaindeks ja alaineks), et teha tõlgetes vormistuslikke muudatusi.
* **Ühe segmendi muutmine**: sihtsegmendile klõpsates saab tõlkes teha soovitud muudatused ja kõik tehtud muudatused salvestuvad automaatselt. 
* Segmendi kustutamine käib prügikasti ikooniga nupust.
* Tõlkemälu redaktoris avamise tegevus logitakse kasutajapõhiselt.

**Massmuudatused ja funktsioon „Leia ja asenda“**  
Sihtkeele otsinguriba paremas osas on noolekesega ikoon, mille alt avaneb asendamise funktsioon. Esmalt tuleb tippida reale „Filtreeri sihttekstist“ otsitav tekst ja seejärel tippida reale „Asenda tekstiga" uus tekst, millega soovitakse tõlget üle kirjutada. Leitud vastete asendamiseks on kaks valitut: „Asenda“ või „Asenda kõik“. Asendus rakendub ainult tekstiosale, mis on otsingu tulemusel leitud. Kõik tehtud muudatused salvestuvad automaatselt. 

**Samaaegne TMi redigeerimine redaktoris**: kui üks kasutaja on tõlkemälu redigeerimist alustanud, siis lukustatakse see teiste kasutajate jaoks. Teised kasutajad ei saa samal ajal seda tõlkemälu redaktoris avada.  


**Pane veelkord tähele!**  
Tõlkemälu saab hallata ja muuta vaid **tõlkemälu omav asutus**. Kui tõlkemälu omanik on teine asutus, siis seda muuta ei saa ja sellesse tõlkesegmente salvestada ei saa. Asutusega jagatud tõlkemälu saab vaid vaadata tõlkemälude nimekirjas ja seda saab lisada oma asutuse tõlketellimustele, et tõlkijad saaksid sealt tõlkevasteid kasutada.  

Tõlkemälude kasutamisest saab juurde lugeda Tõlkevärava Wiki artiklist **„Tõlketööde hankimise parimad praktikad ning põhimõtted“**: https://github.com/keeleinstituut/tv-wiki/wiki/T%C3%B5lket%C3%B6%C3%B6de-hankimise-parimad-praktikad-ning-p%C3%B5him%C3%B5tted  


[END]

[START]

## Tõlketööriista mahuanalüüs

Tõlketööriistas saab lähteteksti **mahtu sõnapõhiselt analüüsida**. Analüüsitakse lähteteksti tekstisisest kattuvust ja ka kattuvusi tõlkemäludega. Analüüsi põhjal saab tõlkimise tasu arvestada ja hinnata tõlkimiseks planeeritavat töökiirust.

**Mahuanalüüs**  
Sõnade, fraaside ja lausete eest, mille vasted on osalise kattuvusega võimaldab tõlke-eelarve pealt kokku hoida. Tõlkemälu kasutamisel võiks hinnasoodustuse arvutamisel kasutada järgnevat mudelit. Selle analüüsipõhise soodustuse saab seadistada iga teostaja all eraldi.

**Näidis analüüsipõhisest soodustusest**  
Korduvad vasted ja täielikud (101%) vasted: tasu täishinnast 25%  
100% kattuvad vasted: tasu täishinnast 25%  
95%-99% kattuvad vasted: tasu täishinnast 50%  
85%-94% kattuvad vasted: tasu täishinnast 50%  
75%-84% kattuvad vasted: tasu täishinnast 75%  
50%-74% kattuvad vasted: tasu täishinnast 100%  
0-49% kattuvad vasted: tasu täishinnast 100%  

101% ja 100% kattuvad vasted peaksid olema tasustatud, sest tõlkija peab need siiski üle kontrollima ja tõlkesse lisama. Tõlkemällu võib kõigest hoolimata vigu jääda ja terminoloogia võib aja jooksul muutuda. Sama sõna, fraas või lause võib nõuda sõltuvalt kontekstist eri kohtades erinevat tõlget. Kui tellija ei soovi 100% kattuvate vastetega teksti eest maksta, ei vastuta tõlkija 100% kattuvate vastetega tõlke õigsuse eest.

**Tõlkimiskiirus**  
Keskmine tõlkimiskiirus on umbes 200 kuni 300 sõna tunnis ja 1500 kuni 2500 sõna päevas. Täpne päevane tõlkemaht sõltub teksti olemusest ja keerukusest ning sellest kas tõlkimisel saab lisaks tõlkemälule kasutada ka masintõlget. Keskmine tõlkimiskiirus masintõlke kasutamise puhul on umbes 400 kuni 700 sõna tunnis ja 5000 sõna päevas.

[END]

[START]

## Tõlkemälu loomine 

Tõlkemälu tuleks nimetada võimalikult täpselt. Hea mälu nimetus viitab tõlkemälu sisule. Soovi korral saab mälule määrata ka valdkonna ja sildi(d), siis on kasutajatel lihtsam mälude nimekirjas otsingut teha ja tellimustele õige sisuga mälud leida ja lisada. Oluline on tõlkemälule määrata ka kasutuspiirang:  
- „Asutuste sisene“ – tõlkemälu on jagatud asutuse kasutajatega, kelle roll lubab mälusid vaadata, hallata ja/või kasutada;  
- „Asutustega jagamiseks“ – tõlkemälu on jagatud ka teiste avaliku sektori asutuste kasutajatega, kelle roll lubab mälusid vaadata, hallata ja/või kasutada;  
- „Avalik“ – tõlkemälu on jagatud kõikide Tõlkevärava kasutajatega.
Kui puudub soov mälusid teiste asutustega või avalikkusega jagada, siis tuleb määrata tõlkemälu kasutuseks „Asutuste sisene“.

[BREAK]

Tõlkemällu saab importida olemasolevaid mälusid. Tõlkeväravasse importimiseks sobib .tmx faililaiendiga tõlkemälufail.

Tõlkemälusid saab hallata kasutaja, kelle rollile on lisatud järgmised privileegid: „Asutuse tõlkemälude vaatamine“, „Asutuse tõlkemälu andmete muutmine“, „Asutuse tõlkemälu eemaldamine“, „Asutuse tõlkemälu import“, „Asutuse tõlkemälu eksport“ ja/või „Asutuse tühja tõlkemälu loomine“. 
Kasutajarollide privileege saab seadistada menüüst „Rollihaldus“.

[END]

[START]

## Tõlketööriist

Tõlkevärava I etapi lahenduses saab tõlketööriistas tõlkida ainult teatud tüüpi tellimusi. Tellimust sisestades peab tellija või tõlkekorraldaja valima tellimuse tüübiks (ostetavaks teenuseks) ühe järgmistest eelseadistatud tellimuse tüübist: „Tõlkimine(CAT)“, „Tõlkimine(CAT), Ülevaatus“, „Tõlkimine(CAT), Toimetamine, Ülevaatus“, „Tõlkimine(CAT), Toimetamine“, „Vandetõlge (CAT)“ või „Vandetõlge (CAT), Ülevaatus“.
Nende tellimuse tüüpide kasutamisel saab tõlkimisel kasutada Tõlkeväravasse sisseehitatud tõlketööriista.

[BREAK]

Pärast tellimuse loomist saab tõlkekorraldaja või samaväärsetete privileegidega kasutaja tellimuse lähtefailid tõlketööriista jaoks ettevalmistada. Failide tõlketööriistas tõlkimiseks tuleb toimida järgmiselt: 
1) valida sobiv(ad) tõlkemälu(d); 
2) märkida linnukes(t)ega fail(id), mida soovitakse tõlkida tõlketööriistas; 
3) klõpsata nupule „Genereeri tõlkimiseks“, misjärel saadetakse tõlgitav(ad) lähtefail(id) tõlketööriista ja genereeritakse kakskeelne XLIFF-fail, mida saab tõlkida.

![XLIFF-i genereerimine](https://github.com/keeleinstituut/tv-tolkevarav/assets/119607967/140d7828-3558-48bc-942b-39ce0888e32b)

**Märkus.** Lähtefaile saab tõlketööriista saata vaid ühe korra ja hiljem faile juurde lisada ei saa. Hiljem lisandunud failid tuleks töösse panna uue tellimusega. Lisaks tuleks veenduda, et on valitud ka soovitud tõlkemälud. Hiljem lisatud tõlkemäludega uut mahuanalüüsi teha ei saa.
**Märkus lähtefailide kohta.** Turvakaalutlustel ühildub tõlketööristaga DOCX- ja XLSX-vorming. Tõlketöörista jaoks peab .doc faili salvestama .docx vormingusse, .xls faili salvestama .xlsx vormingusse ning .csv faili salvestama .xlsx vormingusse.

**Mida on tõlketööriistaga tõlkimiseks vaja?**  
Tõlkevärava tõlketööriist on veebipõhine. Sellega saab töötada vaid veebibrauseris ja arvutis peab olema internetiühendus, et luua ühendus tõlkemälu, masintõlkemootori ja Ekilexiga.

**Mis juhtub, kui internetiühendus katkeb?**  
Tõlkevärav on mõeldud kasutajatele, kellel on internetiühendus.
Ajutise internetiühenduse katkemise korral saab siiski kuni 20 segmenti tõlkida. Tõlkevärav sünkroonib tõlgitud segmendid, kui ühendus taastub.  

### Töötamine tõlketööriistaga
Tõlkimiseks ava kakskeelne XLIFF-fail nupust „Ava tõlketööriistas“. Vasakul pool on tõlkesse saadetud lähtetekst, mis on jaotatud segmentideks. Alusta tõlkimist sihtsegmenti, redigeerides tõlkemälust esitatud tõlkevasteid või masintõlke ettepanekuid.  

Tõlketööriist kuvab vasakul lähtesegmenti ja paremal sihtsegmenti. Klõpsa suvalisel sihtsegmendil, et avada see tõlkimiseks. Tõlkesegmentide sirvimiseks saad lehel üles- ja allapoole kerida.  

![lähte-ja sihtsegment](https://github.com/keeleinstituut/tv-tolkevarav/assets/119607967/fa51fccc-cbf0-4520-8a32-e00e44ef4698)

Kui oled sisestanud oma tõlke, redigeerinud eeltõlget või muutnud eelnevalt tõlgitud segmenti, **peab segmendi kinnitama**. **Kinnitatud segment salvestatakse tõlkemällu ja seejärel saab liikuda järgmise segmendi tõlkimise juurde.**  

**Tõlkesegmendi kinnitamise kaks viisi**  
**1. Nupp „TÕLGITUD“** – klõpsa sellel nupul või kasuta otseteed klahvidega „Crtl+Enter“, et kinnitada aktiivse segmendi tõlge ja salvestada see tõlkemällu.   
**2. Nupp „T+>>“** (tõlgi ja liigu järgmisele tõlkimata segmendile) – klõpsa sellele või kasuta otseteed klahvidega „Crtl+Shift+Enter“, et kinnitada aktiivse segmendi tõlge ja salvestada see tõlkemällu ning liikuda järgmisele tõlkimata segmendile. Pane tähele, et see nupp ilmub kasutajaliidesesse ainult siis, kui tööfailis on juba tõlgitud segmente.  
Mõlemat kinnitamise funktsooni kasutades muutub segmendi staatuse riba värv paremal siniseks.

**Korraga mitme segmendi tõlkimine** – kui sul on vaja korraga mitu segmenti kinnitada, siis vali soovitud segmendid, tähistades need linnukesega. Üles ilmub nupp **„MÄRGI TÕLGITUKS“**. Klõpsa sellel, et kinnitada valitud segmendid. Segmentide staatus **„MUSTAND“** salvestatakse üle staatusega **„TÕLGITUD“**.
Kui tõlge on valmis, saad tõlgitud dokumendi alla laadida, klõpsates lehe paremas ülanurgas nupule „Laadi alla“.


### Kiirklahvide otseteed  

**Nipid kiiremini töötamiseks**  
Tõlkevärava tõlketööriistas saab kasutada otseteena kiirklahve. Vormindamise ja funktsionaalsuste otseteede tundmaõppimine aitab tõlkijal olla produktiivsem ja kiiremini tõlkida. Otseteede nimekirja saab avada, klõpsates tõlketööriista kasutajaliidese ülemisel kolme punktiga tähistatud nupule „Kiirklahvid“.  

### Korduste eeltõlkimine  

Kui ühes töös on identsed ja korduvad segmendid, tähistab tõlketööriist need kordusena.  

![korduv segment](https://github.com/keeleinstituut/tv-tolkevarav/assets/119607967/a9bfe3be-4892-4186-89b5-514a475c2e80)

Pärast korduva segmendi kinnitamist ja tõlkemällu salvestamist eeltõlgib ja kinnitab tõlketööriist automaatselt korduvad segmendid, nii et esimese korduva segmendi tõlget kasutatakse läbivalt eeltõlkena terve faili ulatuses.  
Need segmendid tähistatakse valge ja sinise triibulise staatuse ribaga ja märgisega **„Eeltõlgitud kordus“**.  
 
![eeltõlgitud korduv segment](https://github.com/keeleinstituut/tv-tolkevarav/assets/119607967/9cb05072-558e-4c13-b6a4-36ebe55884c3)

Need segmendid kinnitatakse ja salvestatakse automaatselt. See tähendab, et kasutaja ei pea korduseid ise ükshaaval tõlkima ja kinnitama.
Sel viisil saab kasutaja otsustada, kas automaatselt eeltõlgitud segmente on vaja topelt kontrollida või mitte.  
Kui klõpsata nuppu „Tõlgitud“, salvestatakse automaatselt eeltõlgitud segment ja märgis muutub taas korduseks.  
 
Kui kasutaja muudab ühte tõlget, siis süsteem küsib, kas tõlkija soovib seda muudatust ka teistele tõlgetele rakendada.  
Need märgistatakse uuesti kui **„Eeltõlgitud kordus“**. Vt järgmist näidet:  

![eeltõlgitud korduse ülekirjutamine](https://github.com/keeleinstituut/tv-tolkevarav/assets/119607967/12e3b339-9a46-47cf-823e-dd42a67c80f6)

Kui valida muudatuse rakendamine kõikidele segmentidele, siis ilmub ekraanile kinnituseks hüpikakna sõnum. Ülevaatusrežiimis saab kasutada sama funktsiooni.


### Otsi ja asenda  

Tõlketööriista paremas ülaosas on **luubi ikoon**, mis avab **otsingu- ja asenduse tööriista**.  
See võimaldab otsida konkreetset teksti lähte- või sihtsegmendis ja sõna(paari)de esinemist lähte- ja sihtsegmendis samaaegselt.  

Otsingut saab täpsustada, märgistades kasti „Erista suur- ja väiketähti“ või „Kogu sõna“.  
* **Erista suur- ja väiketähti**: otsingutulemuses arvestatakse otsitava teksti suur- ja väiketähti.  
* **Kogu sõna**: kui see on märgistatud, välistab see kõik otsingutulemused, kus otsitav sõna sisaldub mõnes teises sõnas.  
Otsingut saab kitsendada ka segmendi staatuse järgi, otsides valitud staatusega segmenti: **uus, mustand, tõlgitud ja kinnitatud**. Sel juhul kuvatakse tulemusi ainult segmentidest, mis vastavad valitud staatusele.  
Klõpsa nuppu **„Segmendi staatus“** ja vali, millistele segmentidele soovid otsingut rakendada.  
 
Lisaks saab luubi ikoonist avatud otsingupaneelist teha sihtsegmentides sõnade asendamist. Selleks saab kasutada nuppe „ASENDA“ ja „ASENDA KÕIK“.  
 
![otsing 1](https://github.com/keeleinstituut/tv-tolkevarav/assets/119607967/aeca2594-7300-4b85-868d-e8ea69699fdd)

Pane tähele, et asendamist rakendatakse kõikidele segmentidele. Lisaks teksti muutmisele muudab see ka segmendi staatust. Seega kui asendada termin mustandi staatusega segmendis, siis see muudetakse ja salvestatakse tõlgitud staatusega segmendina.  
 
**Otsi ja asenda funktsioon jagatud tööfailis**  
Kui tõlketellimus on jagatud mitmeks osaks ja määratud tõlkimisse rohkem kui ühele teostajale, siis on ühe osa teostajal võimalik rakendada otsingufunktsiooni kas ainult endale määratud osas või laiendada otsing kogu tööfailile.  
 
Märgi valik „Otsi kõiki osi“ ja klõpsa uuesti nuppu „Leia“.  
 
Sellisel juhul saab liikuda segmentides isegi siis, kui need ei kuulu sulle määratud osasse. Aga nendesse ei saa mingeid muudatusi teha.  


### Segmentide filtreerimine  

Parempoolne segmendi staatuse riba muudab oma värvi sõltuvalt segmendis tehtud tegevustest. Klõpsa ribale, et kuvada staatuse valikute loetelu ja määrata/muuta segmendi staatust.  

**UUS**: segment on puutumata ja seda pole veel avatud. Segmendi staatuse riba värv on valge.  
**MUSTAND**: segmenti ei ole veel redigeeritud ega salvestatud. Segmendi staatuse riba värv on hall.  
**TÕLGITUD**: segmendi tõlge on salvestatud. Segmendi staatuse riba värv muutub valgest siniseks. See näitab, et segment on kinnitatud ja tõlkemällu salvestatud. Kui segmenti ei kinnitata nupust „Tõlgitud“ ja liigutakse käsitsi edasi järgmisele (või klahvidega „Ctrl+Alla“) või eelmisele (või klahvidega „Ctrl+Üles“) segmendile, salvestatakse tõlge XLIFF-faili kuni veebilehe värskendamiseni, kuid tõlkemällu seda ei salvestata. Sellisel juhul muutub segmendi staatuse riba triibuliseks.  
**KINNITATUD**: segmendi tõlge on korrektne (ja toimetatud). Segmendi staatuse riba värv on roheline. Roheline staatuse riba ilmub ka tõlkimisrežiimis, kui segmendil on konteksti sees täpne vaste (101% vaste).  

**Segmendi staatuse järgi filtreerimine**  
Mõnel juhul võib olla tõlkimise ajal vajalik töötada vaid teatud tüüpi segmendiga.  
Tõlketööriista lehe ülemisel ribal on **lehtri ikoon**, mis võimaldab segmente filtreerida. 
Valikus on segmentide filtreerimine järgmiste staatuste järgi.
 
**Uus**: puutumata segmendid, mida ei ole eeltõlgitud tõlkemälu vastete ega masintõlke ettepanekutega.  
**Mustand**: toimetatud/redigeeritud segmendid, kuid veel salvestamata.  
**Tõlgitud**: tõlgitud ja salvestatud segmendid.  
**Kinnitatud**: tõlgitud ja salvestatud segmendid, mis on teist korda üle kinnitatud ja märgitud kinnitatuks.  

**Lisaks saab filtreerida segmente tõlkevaste tüüpide järgi.**  
* 101% kattuvad: näitab segmente, kus on kontekstisisesed täpsed vasted tõlkemälust.  
* Mitte 101% kattuvad: näitab segmente, kus tõlkemälust tulnud vaste on alla 101%.  
* Muudetud 101% vaste: näitab 101% kattuvad segmente, mida on redigeeritud ja muudetud.  
* Kordused: näitab korduvaid segmente.  
* MT: näitab segmente, kus esimene tõlkevaste ettepanek pärineb masintõlkemootorist.  
* 100% kattuvad: näitab segmente, kus esimene tõlkevaste ettepanek on 100% kattuv tõlkemälu vaste.  
* 75%–84% kattuvad: näitab segmente, kus tõlkemäluettepanek on umbkaudne, mille protsent jääb vahemikku 75–84%.  
* 85%–94% kattuvad: näitab segmente, kus tõlkemäluettepanek on umbkaudne, mille protsent jääb vahemikku 85–94%.  
* 95%–99% kattuvad: näitab segmente, kus tõlkemäluettepanek on umbkaudne, mille protsent jääb vahemikku 95–99%.  
* Teha: näitab veel tegemata/tõlkimata segmente. 

[BREAK]

### Tõlkemälu otsingu vahekaart

Tõlkemälu otsingu vahekaardi „TM otsing“ kaudu saab teha käsitsi otsingut tõlkemälust.
See võimaldab kasutajatel otsida konkreetset sõna, väljendit või fraasi ülesandele lisatud tõlkemälu(de)st.

### Tõlkemälu vasted ja masintõlke ettepanekud

Kui avada segment tõlkimiseks, täidab tõlketööriist selle automaatselt tõlkemälu (TM) vastega või masintõlke (MT) ettepanekuga.
Kui masintõlge on sisse lülitatud, pakub tõlketööriist segmendile masintõlke ettepanekut. Kui tõlketööriist tuvastab tõlkemälu vaste, pakub see segmendile tõlkemälu vastet ettepanekuna. Kui MT on välja lülitatud ja tõlkemälust vastet ei ole, jätab süsteem sihtsegmendi tühjaks.
 
Vahekaart **„Tõlkevasted“** – sellel vahekaardil kuvatakse kolm kõrgeima kattuvusprotsendiga olemasolevat vastet aktiivse segmendi jaoks, sealhulgas vaste kattuvusprotsent, selle allikas ja loomise kuupäev. Ühe pakutud vaste valimiseks ja muutmiseks saab kasutada otseteed klahvidega „Ctrl+1/2/3“.
Tõlketööriist pakub tõlkemälu ettepanekuid, mis vastavad tõlkemälust leitud vastetele, samuti masintõlke ettepanekuid, kui MT on aktiveeritud.
Ettepanekud on järjestatud vastavalt nende vastavusprotsendile, alates kõrgeimast kuni madalaimani. Nagu eelnevalt mainitud, kuvatakse kõrgemate tõlkemälu vastavusprotsentide puudumisel esmajärjekorras masintõlget.
Iga TM-i ettepaneku puhul on selle kirje paremas allnurgas allikas järgmiste andmetega: tõlkemälu nimetus, vastavusprotsent ja loomise kuupäev.
 
Tõlkemälust pärinevaid tõlkeid kuvatakse koos selle vastavusprotsendiga, mis on rohelisel või kollasel taustal. Masintõlke ettepanek kuvatakse tähisega **MT**. **Soovitud tõlkemälu vaste või masintõlke ettepaneku valimiseks ja sisestamiseks sihtsegmenti on kaks võimalust**:
* kasuta otseteed „Ctrl+[1/2/3]“, sõltuvalt milline kolmest sobib; või
* tee topeltklõps sobival ettepanekul.

[BREAK]

### Vormingu siltidega seotud probleemide lahendamine

Tõlkevärava tõlketööriist kasutab vormingu silte kahel põhjusel.
* Vormingu silt säilitab tõlgitava faili andmestruktuuri ja aitab vältida failiformaadi konverteerimise probleeme.
* Vormingu silt tagab selle, et tõlgitud failis oleks teksti paigutus ja küljendus samasugune nagu lähtefailis.

[BREAK]

**Vormingu sildi vigadest lähemalt**

Tõlketööriist hoiatab kolme tüüpi probleemidest.
1. Vormingu sildi mittevastavus
2. Vormingu sildi järjekorra mittevastavus
3. Vormingu sildi tüübi mittevastavus

[BREAK]

**1. Vormingu sildi mittevastavus**
Tõlketööriist hoiatab kasutajat, kui mõni vormingu silt on sihtkeele segmendist puudu. Puuduvast vormingu sildist annab süsteem märku veateatega. 
 
Lähtekeele vormingu silt „XY“ puudub sihtsegmendist.
**Seda tüüpi viga tuleks parandada. Vastasel juhul võib tõlgitud faili jääda tõlkimata sisu.**

**2. Vormingu sildi järjekorra mittevastavus**
Tõlketööriist hoiatab kasutajat, kui lähtesegmendis ei ole vormingu sildid paigutatud sihtsegmendiga samasse kohta. Segmendi all kuvatakse selle kohta veateade.
 
Vormingu silt ... on sihtsegmendis paigutatud teistsugusesse kohta kui lähtesegmendis.

**Vormingu siltide järjekorra mittevastavus ei takista üldjuhul tõlkefaili allalaadimist ega tekita tõlgitud failis vorminguprobleeme.** 
Sellegipoolest soovitame seda laadi vead tõlketööriistas ära parandada.

Märkus. Mõnel juhul peab tõlkimisel vormingu siltide järjekorda muutma, sest sihtkeele grammatika nõuab seda. Sellisel juhul võib veateateid vormingu sildi järjekorra mittevastavuse kohta ignoreerida.


**3. Vormingu sildi tüübi mittevastavus**
Tõlketööriist hoiatab kasutajat, kui lähtekeelse segmendi vormingu sildi tüüp ei vasta sihtkeelse segmendi sildi omale.

Veateade: „Vormingu sildi tüübi mittevastavus: vormingu siltide tüübid ei klapi.“
See on vormingu sildi viga. Kui seda viga ignoreerida, siis võib tõlgitud faili jääda tõlkimata sisu.

**Kuidas vormingu siltide probleeme lahendada?**
Vormingu sildiga seotud probleemide lahendamiseks on neli viisi.
1. Klõpsa kursor tekstis sinna, kus vormingu silt puudub ja sisesta seejärel sümbol „<“ või kasuta klahvikombinatsiooni „Alt+t“.
Seejärel avaneb aken. Klõpsa vormingu sildile, mida soovid tõlkesse valikust lisada.
2. Klõpsa lähtesegmendis oleval vormingu sildil ja lohista see sihtsegmenti.
3. Klõpsa ikoonile: 
![image](https://github.com/keeleinstituut/tv-tolkevarav/assets/119607967/204e9511-3649-485b-8bb1-7b1f1a6cf09a)
Seejärel saad kopeerida vormingu sildid lähtesegmendist sihtsegmenti (vormingu sildid lisatakse sihtsegmendi teksti lõppu ja need ilmuvad samas järjekorras nagu lähtesegmendis). 
4. Kopeeri ja kleebi vormingu silt lähtesegmendist sihtsegmenti, paiguta see õigesse kohta ja kustuta vales kohas olev vormingu silt.

[BREAK]

### Vormingu siltidest lähemalt

Vormingu sildid on märgised, mis tähistavad XLIFF-failis seda, kuidas teatud tekstiga seotud teavet tuleks töödelda. Tõlketööriistades kasutatakse üldiselt **vormingu silte** (nimetatakse ka tägideks), et tähistada teksti osi, millel on tavatekstist erinev vorming, st erinevad kirjatüübid, erinevad kirjasuurused või erinevad värvid. Mõnikord on need vaid väikesed (või isegi nähtamatud) muutused.
Tõlkevärava tõlketööriist kasutab vormingu silte, et tagada lähteteksti ja sihtteksti paigutuse ja vormingu vastavus.


### Tõlke allalaadimine tõlketööriistast

Tõlketeksti saab alla laadida alamtellimuse vaates kolme täpiga ikoonist avanevast allalaadimise nupust **„Laadi alla valmis tõlge“**. 

![Tõlke allalaadimine_tellimuse vaates](https://github.com/keeleinstituut/tv-tolkevarav/assets/119607967/bca5faa0-1a98-4007-955d-ac857495ca9c)

Enne valmis tõlke alla laadimist veendu, et kõik segmendid on tõlgitud (edenemise riba on jõudnud 100%-ni) ja lahendatud on kõik QA probleemid.
Kui tõlkimisesse saadeti DOCX-fail, siis laaditakse alla tõlgitud DOCX-fail jne. Kui lähtefaile oli rohkem kui üks, siis laaditakse need kõik alla pakitud zip-kaustana. St ülesandest ei ole võimalik üksikuid faile eraldi alla laadida. Saab alla laadida kõik failid korraga.

Lisaks saab ka tõlketööriista vaates noole ikooniga nupule klõpsates alla laadida järgmised failid:
* originaal (lähtefail);
* ekspordi XLIFF, mis sisaldab nii lähteteksti kui ka sihtteksti;
* ekspordi TMX, mis sisaldab tellimuse tõlkemälu.

[END]
[START]

## Tellimuste aruande eksport

Tellimuste andmete töötlemiseks saab need Tõlkeväravast välja eksportida. Määrata tellimuste periood ja soovikorral ka tellimuste staatus. Staatust ei pea valima. Kui jätta see valik tegemata, siis tellimuste aruandesse eksporditakse kõik valitud perioodi tellimused.

[BREAK]

Eksporditav fail on CSV-fail. Andmete eksportimine võib olla vajalik perioodikokkuvõtete koostamiseks, statistika tegemiseks jms.

[END]

[START]

## Keeletööriistad

Keeletööriistade lehel saab Tõlkevärava kasutaja masintõlkida teksti või faili tõlketellimust esitamata. Valida saab kahe keelemudeli vahel: **eTranslation** (Euroopa Komisjoni masintõlketeenus; kõigil asutustel on ühine litsents) ja **Azure OpenAI (Copilot)** (Microsofti suur keelemudel; asutusepõhine litsents). Copiloti kasutamiseks tuleb asutuse peakasutajal Azure OpenAI API võti Tõlkeväravasse ühendada „Asutuse sätted“ kaudu.

Keeletööriistade kasutamine
1. Valida **keelesuund**: lähtekeel vasakul ja sihtkeel paremal. Keelesuunda saab vahetada noolenupu abil.  
2. Valida **tööriist**: kas tavaline masintõlge (eTranslation) või suur keelemudel Azure OpenAI (Copilot).  
3. eTranslationi puhul määrata ka teksti **valdkond**. See aitab masinal leida täpsemaid termineid ja koostada korrektsema tõlke.  
4. Copiloti puhul tuleb valida sobiv **viip** ehk käsklus, mida keelemudel tekstiga tegema peab.  
5. Sisestada oma tekst väljale „Lähtetekst" (maksimaalselt 5000 tähemärki) või laadida üles fail (vahekaardilt **„Fail“**).  
6. Klõpsata nupule **„Alusta“** ja seejärel alustab valitud keelemudel teksti töötlemist.  

Tõlge ilmub paremale väljale „Sihttekst“. Masina koostatud teksti saab kopeerida lõikelauale klõpsates kopeerimisnupule „Sihttekst“ välja paremas ülanurgas.

Keeletööriistade kasutamiseks peab kasutaja rollile olema lisatud privileegid **„ETranslation masintõlke kasutamine“** ja **„OpenAI Azure masintõlke kasutamine“**. Privileegi puudumisel ei kuvata kasutajale menüüd „Keeletööriistad“. Privileege saab seadistada asutuse peakasutaja.

[BREAK]

**eTranslation – valdkonna valik**

eTranslation on Euroopa Komisjoni masintõlkemootor, mis on loodud ELi institutsioonide dokumentide tõlkimiseks. Masintõlkekvaliteet on kõrgem, kui valida tekstile vastav valdkond. Valdkonnad, mida masintõlkemootor oskab tõlkida on järgmised.

- **Üldine tekst** – tavapärane asjaajamistekst, mis ei kuulu ühtegi allpool loetletud valdkonda
- **ELi ametlik tekst** – ELi institutsioonide ametlikud dokumendid ja õigusaktid
- **Euroopa Keskpank** – rahandus- ja pangandusalane tekst
- **Intellektuaalomandi amet** – patendid, kaubamärgid ja autoriõigus
- **Kvaliteedihinnang** – hindamis- ja auditidokumendid
- **Euroopa Kohus** – kohtuotsused ja kohtumenetluse materjalid

Kui teksti sisu ei vasta ühelegi loetletud valdkonnale, siis tuleb valida „Üldine tekst“. Lisaks rõhutame, et kuigi masintõlketehnoloogia on aastate jooksul märkimisväärselt arenenud, võivad masintõlke kvaliteet ja täpsus sõltuvalt teksti valdkonnast ja keelepaarist varieeruda.

**Azure OpenAI (Copilot) – tõlkemalli valik**

Azure OpenAI (Copilot) suure keelemudeli kasutamisel saab valida nelja viiba vahel, mis on kohandatud tegema järgmist.

- **Tõlgi (standard)** – tavaline otsetõlge lähteteksti sisu muutmata
- **Tee kokkuvõte (tõlgi)** – loob lähteteksti põhjal kokkuvõtte sihtkeeles
- **Kasuta ametlikku stiili (tõlgi)** – tõlgib teksti ametliku asjaajamiskeele normidele vastavas stiilis
- **Paranda ja viimistle (toimetamine)** – parandab ja korrigeerib juba sihtkeeles kirjutatud teksti (st ei tõlgi lähtekeelest, vaid parendab sihtkeelset teksti)

**Failide tõlkimine**

Faili masintõlkimiseks valida vahekaart **„Fail“**. Laadida fail üles. Tõlkida saab järgmisi failivormingud: .docx, .xlsx, .pdf, .txt. Üles laaditud fail kuvatakse jaotises „Lisatud fail“. Klõpsates nupul **„Alusta“** saadetakse fail masintõlkesse. Tõlkimise edenemist tähistab märge „Tõlkimine käib...“ paremal pool jaotises „Tõlgitud failid“. Kui tõlge on valmis, saab tõlgitud faili alla laadida.

Faili tõlkimise vaates on saadaval ka nupp **„Vormista tellimuseks“**. See võimaldab masintõlke tulemuse põhjal koostada ametliku tõlketellimuse. Näiteks kui soovitakse teksti täiendavalt toimetada professionaalse tõlkija poolt, sest masintõlkest ei piisanud. Tellimuseks vormistamisel kantakse fail üle tellimusvormile, kus kasutaja saab täiendada tellimuse andmeid ja esitada tavalise tellimuse.

[END]

[START]

## Sildid
Asutus saab võtta kasutusele enda vajaduste järgi kohandatud siltide süsteemi, mis aitab tõlkeid paremini korraldada. Siltide kategooriaid on viis: oskused, valdkonnad, teostajad, tõlkemälud ja tellimused.  

**Oskused**  
Need on seotud töövoogudega ning teostajate andmebaasi lisatud teostajate oskuste ja hinnakirjadega.  
**Valdkond**  
Need on seotud töövoogudega ja tõlkemäludega. Igal tellimusel ja tõlkemälul on küljes valdkonna silt.  
**Tellimus**  
Tellimustele saab lisada silte, mis aitavad tellimusi hallata ning siltide järgi tellimusi otsida ja filtreerida.  
**Teostaja**  
Teostajatele saab lisada silte, mis aitavad teostajate andmebaasist teostajaid siltide järgi otsida ja filtreerida.  
**Tõlkemälud**  
Tõlkemäludele saab lisada silte, mis aitavad tõlkemälusid hallata ning siltide järgi tõlkemälusid otsida ja filtreerida.  

[BREAK]

* **Oskuste** all on loetelu teenustest, mida teostajad osutavad. Oskusi saab teostajate andmebaasi lisatud kasutajatele nende andmete seadistamisel/muutmisel lisada. Oskuste põhjal saab teostajatele hinnakirju luua. Oskusi ei saa ise muuta, kustutada ega juurde lisada. Uute lisamiseks tuleb kirjutada Tõlkevärava klienditoele.
* **Valdkonna** siltide all on loetelu Tõlkevärava peamistest valdkondadest. Igat tellimust sisestades ja igat tõlkemälu luues tuleks sellele määrata valdkond. Need sildid aitavad eri sisuga tellimusi/mälusid eristada, filtreerida ja otsida. Valdkondi ei saa ise muuta, kustutada ega juurde lisada. Uute lisamiseks tuleb kirjutada Tõlkevärava klienditoele.
* **Tellimusega** seotud siltide funktsionaalsus lubab tellimustele lisada asutusepõhiseid märkeid. See võimaldab asutusel kasutusele võtta tellimuste haldamiseks endale sobiva tellimuste tähistamise süsteemi. 
* **Teostajatega** seotud siltide funktsionaalsus lubab teostaja andmebaasi lisatud kasutajatele lisada asutusepõhiseid märkeid. See võimaldab asutusel kasutusele võtta teostajate andmebaasi haldamiseks endale sobiva teostajate tähistamise süsteemi.  
* **Tõlkemäludega** seotud siltide funktsionaalsus lubab tõlkemäludele lisada asutuse põhiseid märkeid. See võimaldab asutusel kasutusele võtta tõlkemälude haldamiseks endale sobiva tõlkemälude tähistamise süsteemi.  
 

Silte saab hallata kasutaja, kelle rollile on lisatud järgmised privileegid: „Siltide lisamine“, „Siltide muutmine“ ja/või „Siltide eemaldamine“. Kasutajarollide privileege saab seadistada menüüst „Rollihaldus“.

[END]

[START]

## Asutuse andmete haldamine

Asutuse andmetes saab muuta järgmisi üldandmeid: asutuse nimetus, asutuse lühend, meiliaadress, telefoninumber. Tõlkevärav kasutab asutuse lühendit tellimustele numbri loomisel.

**Tööajad ja puhkepäevad**  
Asutuse andmetes saab määrata ja muuta asutuse tööaegu ja puhkepäevi. Asutuse tööajad ja puhkepäevad määratakse vaikimisi ka kõikidele asutuse kasutajatele. Soovi korral saab kasutaja andmete all neid muuta, kui need erinevad asutuse omadest.

**Üksused**  
Asutuse andmete all saab luua ja muuta asutuse üksusi. Üksusi saab kasutada kasutajate kontaktandmetes, et eristada/filtreerida ja grupeerida erinevate üksuste kasutajaid.   

**Auditlogi sätted**  
Vaikimisi säilitatakse Tõlkevärava auditlogisid süsteemis 730 päeva. Asutus saab seda perioodi soovi korral pikendada.  

**Kalendri sätted**  
Kalendris saab valida peamised tellitavad suulise tõlketeenuse keeled, mida kalendri peavaates kasutajatele kuvatakse. Asutus saab kalendri keelte loetelusse lisada kõik võõrkeeled, mida tellitakse. Keelesuunda kalendris valida ei saa. Süsteem lähtub sellest, et üks keeltest on alati eesti keel ja kasutaja valib võõrkeele, millest või millesse tõlgitakse.

[BREAK]

[END]

[START]

## Asutuse süsteemi sätted

Asutuse ülestes sätetes saab hallata tõlkeanalüüsipõhist soodustuste tabelit. Analüüsipõhise soodustuse protsendid võetakse üle vaikeväärtusena teostajate hinnakirjadesse. Kui asutuse analüüsipõhine soodustuse tabel on kinnitatud, siis võib selle alusel luua teostajatele hinnakirjad.

**Märkus.** Kui muuta asutuse üleseid soodustuse protsente pärast teostajate hinnakirjade loomist, siis see ei kirjuta tagasiulatuvalt teostajatele juba loodud hinnakirja soodustusprotsente üle.

[BREAK]

Võimalik on ka asutusepõhisest soodustustes teistsugust soodustuse süsteemi kokku leppida. Iga teostaja andmetes saab määrata kasutajale teistsugused protsendid (% hinnast = makstav tasu teostajaga kokkulepitud ühiku täishinnast). Lisaks saab üksikute tellimuste all kokkuleppel teostajatega makstavate tasude andmetes soodustuse protsente käsitsi muuta. Asutuase tõlkeanalüüsipõhine soodustuste tabel on vaikeväärtusena süsteemis kasutusel.  
Tõlkemälu kasutamisest ja selle pealt hinnasoodustuse arvutamise põhimõtetest saab rohkem lugeda Tõlkevärava Wikist: https://github.com/keeleinstituut/tv-wiki/wiki/T%C3%B5lket%C3%B6%C3%B6de-hankimise-parimad-praktikad-ning-p%C3%B5him%C3%B5tted#t%C3%B5lkimisest-%C3%BCldiselt 

[END]

[START]

## Auditlogid

Logide kuvamiseks ja .csv faili eksportimiseks tuleb määrata parameetrid, mille kohta andmeid otsitakse.  
Logidest saab vaadata järgmist:  
- kasutajate sisse-ja väljalogimine;  
- kasutajate lisamine/deaktiveerimine/arhiveerimine;  
- teostajate andmete muutmine;  
- tellimuste lisamine/muutmine/tühistamine;  
- rollide lisamine/muutmine/kustutamine;  
- süsteemiteadete saatmine;  
- failide lisamine/kustutamine/eksportimine.  

[BREAK]

Logisid säilitatakse 731 päeva.

[END]`

export default manualText
