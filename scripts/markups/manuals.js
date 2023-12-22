const manualsText = `# Kasutusjuhend

## Tõlketööriist

[BREAK]

### Töötamine tõlketööriistaga
Tõlkimiseks ava XLIFF-fail. Vasakul pool on lähtetekst, mis on jaotatud segmentideks. Alusta tõlkimist sihtsegmenti, redigeerides tõlkemälust esitatud tõlkevasteid või masintõlke ettepanekuid.  
Tõlketööriist kuvab vasakul lähtesegmenti ja paremal sihtsegmenti. Klõpsa suvalisel sihtsegmendil, et avada see tõlkimiseks. Tõlkesegmentide sirvimiseks saad lehel üles- ja allapoole kerida.  
Kui oled sisestanud oma tõlke, redigeerinud eeltõlget või muutnud eelnevalt tõlgitud segmenti, peab segmendi segmendi kinnitama. Kinnitatud segment salvestatakse tõlkemällu ja seejärel saab liikuda järgmise segmendi tõlkimise juurde.  

**Tõlkesegmendi kinnitamise kaks viisi**  
**1. Nupp „Tõlgitud“** – klõpsa sellel nupul või kasuta otseteed klahvidega „Crtl+Enter“, et kinnitada aktiivse segmendi tõlge ja salvestada see tõlkemällu.   
**2. Nupp „T+>>“** (tõlgi ja liigu järgmisele tõlkimata segmendile) – klõpsa sellele või kasuta otseteed klahvidega „Crtl+Shift+Enter“, et kinnitada aktiivse segmendi tõlge ja salvestada see tõlkemällu ning liikuda järgmisele tõlkimata segmendile. Pane tähele, et see nupp ilmub kasutajaliidesesse ainult siis, kui tööfailis on juba tõlgitud segmente.  
Mõlemat kinnitamise funktsooni kasutades muutub segmendi staatuse riba värv paremal siniseks.

**Korraga mitme segmendi tõlkimine** – kui sul on vaja korraga mitu segmenti kinnitada, siis vali soovitud segmendid, tähistades need linnukesega. Üles ilmub nupp „MÄRGI TÕLGITUKS“. Klõpsa sellel, et kinnitada valitud segmendid. Segmentide staatus „MUSTAND“ salvestatakse üle staatusega „TÕLGITUD“.
Kui tõlge on valmis, saad tõlgitud dokumendi alla laadida, klõpsates lehe paremas ülanurgas nupule „Laadi alla“.

**Mida on tõlketööriistaga tõlkimiseks vaja?**  
Tõlkevärava tõlketööriist on veebipõhine. Sellega saab töötada vaid veebibrauseris ja arvutis peab olema internetiühendus, et luua ühendus tõlkemälu, masintõlkemootori ja Ekilexiga.

**Mis juhtub, kui internetiühendus katkeb?**  
Tõlkevärav on mõeldud kasutajatele, kellel on internetiühendus.
Ajutise internetiühenduse katkemise korral saab siiski kuni 20 segmenti tõlkida. Tõlkevärav sünkroonib tõlgitud segmendid, kui ühendus taastub.  

### Kiirklahvide otseteed  

**Nipid kiiremini töötamiseks**  
Tõlkevärava tõlketööriistas saab kasutada otseteena kiirklahve. Allpool toodud otseteede tundmaõppimine aitab tõlkijal olla produktiivsem ja kiiremini tõlkida.  
Otseteede nimekirja saab avada, klõpsates tõlketööriista kasutajaliidese ülemisel kolme punktiga tähistatud nupule „Kiirklahvid“.  

### Korduste eeltõlkimine  

Kui ühes töös on identsed/korduvad segmendid, tähistab tõlketööriist need kordusena.  

Pärast korduva/identse segmendi kinnitamist ja tõlkemällu salvestamist eeltõlgib ja kinnitab tõlketööriist automaatselt identsed/korduvad segmendid, nii et esimese korduva segmendi tõlget kasutatakse läbivalt eeltõlkena terve faili ulatuses.  
Need segmendid tähistatakse valge ja sinise triibulise staatuse ribaga ja märgisega „Eeltõlgitud kordus“.  
 
Need segmendid kinnitatakse ja salvestatakse automaatselt. See tähendab, et kasutaja ei pea korduseid ise ükshaaval tõlkima ja kinnitama.
Sel viisil saab kasutaja otsustada, kas automaatselt eeltõlgitud segmente on vaja topelt kontrollida või mitte.  
Kui klõpsata nuppu „Tõlgitud“, salvestatakse automaatselt eeltõlgitud segment ja märgis muutub taas korduseks.  
 
Kui kasutaja muudab ühte tõlget, siis süsteem küsib, kas tõlkija soovib seda muudatust ka teistele tõlgetele rakendada.  
 
Need märgistatakse uuesti kui „Eeltõlgitud kordus“. Vt järgmist näidet:  
 
Kui valida muudatuse rakendamine kõikidele segmentidele, siis ilmub ekraanile hüpikakna sõnum.  

### Otsi ja asenda  

Tõlketööriista paremas ülaosas on luubi ikoon, mis avab otsingu- ja asenduse tööriista.  
See võimaldab otsida konkreetset teksti lähte- või sihtsegmendis ja sõna(paari)de esinemist lähte- ja sihtsegmendis samaaegselt.  

Otsingut saab täpsustada, märgistades kasti „Erista suur- ja väiketähti“ või „Kogu sõna“.  
* **Erista suur- ja väiketähti**: otsingutulemuses arvestatatakse otsitava teksti suur- ja väiketähti.  
* **Kogu sõna**: kui see on märgistatud, välistab see kõik otsingutulemused, kus otsitav sõna sisaldub mõnes teises sõnas.  
Siin on mõned näited.
 
Sellisel juhul on üks tulemustest, mis on esitatud sõna ... kohta, ... .
 
Kui märgistada valik „Kogu sõna“, pakub otsing ainult sõna ... (kuid mitte children) esinemisi.
 
Otsingut saab kitsendada ka segmendi staatuse järgi, otsides valitud staatusega segmenti: uus, mustand, tõlgitud, kinnitatud, tagasi lükatud. Sel juhul kuvatakse tulemusi ainult segmentidest, mis vastavad valitud staatusele.  
Klõpsa nuppu „Segmendi staatus“ ja vali, millistele segmentidele soovid otsingut rakendada.  
 
Lisaks saab luubi ikoonist avatud otsingupaneelist teha sihtsegmentides sõnade asendamist. Selleks saab kasutada nuppe „ASENDA“ ja „ASENDA KÕIK“.  
 
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
Tõlketööriista lehe ülemisel ribal on lehtriikoon, mis võimaldab segmente filtreerida. 
Valikus on segmentide filtreerimine järgmiste staatuste järgi.
 
**Uus**: puutumata segmendid, mida ei ole eeltõlgitud tõlkemälu vastete ega masintõlke ettepanekutega.  
**Mustand**: toimetatud/redigeeritud segmendid, kuid veel salvestamata.  
**Tõlgitud**: tõlgitud ja salvestatud segmendid.  
**Kinnitatud**: tõlgitud ja salvestatud segmendid, mis on teist korda üle kinnitatud ja märgitud kinnitatuks.  

**Lisaks saab filtreerida segmente tõlkevaste tüüpide järgi.**  
101% kattuvad: näitab segmente, kus on kontekstisisesed täpsed vasted tõlkemälust.  
Mitte 101% kattuvad: näitab segmente, kus tõlkemälust tulnud vaste on alla 101%.  
Muudetud 101% vaste: näitab 101% kattuvad segmente, mida on redigeeritud ja muudetud.  
Kordused: näitab korduvaid segmente.  
MT: näitab segmente, kus esimene tõlkevaste ettepanek pärineb masintõlkemootorist.  
100% kattuvad: näitab segmente, kus esimene tõlkevaste ettepanek on 100% kattuv tõlkemälu vaste.  
75%–84% kattuvad: näitab segmente, kus esimene tõlkemäluettepanek on umbkaudne, mille protsent jääb vahemikku 75–84%.  
85%–94% kattuvad: näitab segmente, kus esimene tõlkemäluettepanek on umbkaudne, mille protsent jääb vahemikku 85–94%.  
95%–99% kattuvad: näitab segmente, kus esimene tõlkemäluettepanek on umbkaudne, mille protsent jääb vahemikku 95–99%.  
Teha: näitab veel tegemata/tõlkimata segmente. 












## Kasutajate haldus

**Kasutaja lisamine**

Uute kasutajate lisamiseks klõpsa nupule „Lisa kasutajad“. Kasutaja(te) lisamiseks süsteemi tuleb importida kasutaja(te) andmed CSV failiga. Laadi mall alla siit ([kasutajad_utf.csv](https://github.com/keeleinstituut/tv-tolkevarav/files/13228812/kasutajad_utf.csv)).

**Kasutaja andmete haldamine**

Kasutajate andmete haldamiseks tuleb klõpsata valitud kasutaja kasutajakonto ID lingile. Kasutaja kontaktandmete vaates saab teha järgmist:
* määrata tema tööaegu,
* lisada puhkuseid,
* muuta kasutaja nime, meili, telefoninumbrit ja üksust,
* muuta tema konto rolli (juurdepääsuõiguseid) ning
* kontot deaktiveerida/arhiveerida.

[BREAK]

**Aktiveerimine/arhiveerimine**

Konto deaktiveerimisel kasutaja juurdepääsuõigused peatatakse ja tema roll(id) võetakse ära. See sobib kasutaja juurdepääsu ajutiseks peatamiseks. Kui pole soovi kontot hiljem taas aktiveerida, siis tuleks kasutaja konto arhiveerida.  
Kui kasutaja konto deaktiveeritakse ja kasutaja pole ise oma poolikuid töid kolleegidele suunanud, siis on vaid vastavate õigustega kasutajal juurdepääs tema poolikutele tellimustele, alamtellimustele ja ülesannetele. Dekativeeritud konto aktiveerimiseks tuleb klõpsata nupule „Aktiveeri konto“ ja kontole määrata rollid. Kasutaja juurdepääs taastatakse ja ta näeb endaga seotud tellimuste, alamtellimuste või ülesannete ajalugu, kui tema uus roll seda lubab.  
Aktiveeritud/deaktiveeritud kasutajale ei saa uut kontot samas asutuse luua. Arhiveeritud kasutajaga seotud isikukoodile saab uue konto luua: süsteemis luuakse uue unikaalse identifikaatoriga konto, mis on kasutaja isikukoodiga seotud ja sellega seotakse ka kõik uued tellimused (vana kontoga seotud tellimusi selle kontoga ei seota).


## Kasutajate lisamine

Kasutaja lisamiseks süsteemi tuleb importida kasutaja andmed CSV failiga. Laadi faili mall alla siit. Kasutaja(te) lisamine töötab vaid selle malliga.
Kasutaja konto loomiseks tuleb failis kasutaja(te) andmetega täita vajalikud andmeväljad. Kui CSV failis ei ole konkreetse kasutaja roll määratud, siis saab kasutaja automaatselt tellija rolli. Pärast faili üleslaadimist tuleb kontrollida, et kõik andmed oleksid korrektsed ja vajadusel parandada vead. Kui kõik andmed on korrektsed, siis klõpsa „Salvesta ja saada teavitused“ nupule. Seejärel saavad kõik uued kasutajad teate, et neile on loodud konto Tõlkeväravas.

[BREAK]

## Rollihaldus

Soovitame Tõlkeväravasse luua järgmised rollid:  
* tellija;    
* teostaja;  
* tõlkekorraldaja;  
* asutuse peakasutaja.  

Asutuse rollidele antud privileege saab lisada ja kustutada asutuse peakasutaja. Uusi rolle luua või rolle kustutada saab samuti vaid asutuse peakasutaja. Iga asutus saab rolle juurde luua, kustutada ja ümber nimetada. Seega rollide arv ja nende nimetused võivad erineda sõltuvalt asutusest.

[BREAK]

Rollidele haldamisega seotud privileegid:  
* „Rollihalduse tabeli vaatamine“ – lubab rollide tabelit vaid vaadata;  
* „Rolli lisamine süsteemi“ – lubab rollide tabelise lisada juurde uusi rolle;  
* „Rolli muutmine (privileegide lisamine/ eemaldamine)“ – lubab olemasolevate rollide privileege muuta;  
* „Rolli kustutamine“ – lubab olemasolevaid rolle kustutada.  

Link rollide seadistamise näidisele, mis aitab rolle luua ja seadistada: https://github.com/keeleinstituut/tv-tolkevarav/files/12485432/_privileegide.tabel-310823-110333.pdf.

## Tellimused

Tellimuste lehel kuvatakse kõiki sisseloginud kasutajaga seotud tellimusi.
Kui kasutajale on antud juurdepääs, et näha ka asutuse teisi tellimusi, siis saab eemaldada linnukese valikust „Soovin näha vaid oma tellimusi“ ja kuvatakse kõiki tellimusi.
Lisaks saab tellimusi filtreerida tellimuse ID, keelesuuna, tüübi, siltide, staatuse ja maksumuse järgi.

[BREAK]

**Tellimuste staatused**  
- Uus – tellija loodud uus tellimus  
- Registreeritud – tõlkekorraldajale töösse registreeritud tellimus  
- Tühistatud – tühistatud tellimus  
- Tellijale edastatud – tellijale saadetud valmis tellimus  
- Tagasi lükatud – tellija poolt tagasi lükatud valmis tellimus  
- Parandatud – tellijale saadetud parandatud valmis tellimus  
- Vastu võetud – tellija poolt vastu võetud valmis tellimus

## Tellimuse detailid

Tellimuse detailide all kuvatakse tellimuse üldandmeid, alamtellimuste andmeid ja tellimuse lähte-ja valmisfaile.
Tellimuse üldandmeid ja sellega seotud alamtellimusi saab muuta tõlkekorraldaja rolliga kasutaja.
Tellija rolliga kasutaja (kellele on vastav privileeg) saab tellimuse üldandmetes muuta vaid tellimuse omaniku nime (isik, kelle nimele tellimus on tehtud).

[BREAK]

## Tellimuse lisamine

Tellimuse lisamisel on oluline määrata tellimusele järgmised parameetrid.
 - Määrata tellija (isik, kelle nimele tellimus vormsitatakse ja/või kellele valmis tellimus tagasi saadetakse).
 - Määrata tõlkekorraldaja, kellele tellimus suunatakse. Selle välja võib ka tühjaks jätta.
 - Määrata tellimuse tüüp. See on teenus, mida soovitakse tellida.
 - Määrata tellimuse valdkond.
 - Määrata tellimusele soovitud valmimise aeg.
 - Kirjutada tõlkekorraldajale tellimuse erijuhised (näiteks tõlke vormistamise soov, kasutatava terminoloogia erisoovid või muud vajalikud juhised).
 - Kirjutada viitenumber (olenevalt asutusest võib siia märkida asutusesiseselt kokkulepitud viis tellimusi nimetada/nummerdada). Selle välja võib ka tühjaks jätta.
 - Määrata lähtekeel ja sihtkeel(ed).
 - Lisada tõlgitav(ad) fail(id).
 - Lisada soovi korral abifail(id) ja määra nendele tüüp (abifail, stiilijuhis või terminibaas). Abifail on materjal, mis võib tellimuse teostamisel olla vajalik (nt varasemad tõlked, lähtefailiga seotud dokumendid või muu taustamaterjal).
 Kõiki tellimuse parameetreid ja faile saab hiljem tõlkekorraldaja vajadusel muuta ja täiendada.

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
- Vandetõlge (CAT), ülevaatus – VT  
- Vandetõlge (CAT) – VT  
- Vandetõlge, Ülevaatus – VT  
- Vandetõlge – VT

**2. Valdkond**  
Valdkondi kasutatakse Tõlkeväravas tellimuste all kui ka tõlkemälude all. Valdkonna saab määrata üksikutele tellimustele ja ka tõlkemäludele. Loetelu valdkondadest ja nende lühenditest:  
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

**3. Tähtaeg**  
Tähtaeg viitab tellimusele määratud valmimise ajale.

**4. Erijuhised tellimuse kohta**  
Iga tellimusega võib kaasa panna ka juhiseid. Need on mõeldud tõlkekorraldajale, tõlkijale/tõlgile ja/või toimetajatele. 

**5. Viitenumber**  
Tellimuse viitenumbri reale saab sisestada tellimuse nimetuse või muu numbri, mille järgi saab tellimust hiljem süsteemist otsida. Sõltuvalt asutusest võib viitenumbri lisamise süsteem ja kord erineda.

**6. Lähtekeel**  
Valida saab ühe lähtekeele. Kui soovitakse tõlkida mitmest lähtekeelest, siis tuleks luua eraldi tellimused.

**7. Sihtkeel**  
Valida saab ühe või mitu sihtkeelt. Iga keele kohta luuakse tellimuse alla eraldi keelepaaripõhine alamtellimus.

**8. Lähtefailid**  
Kirjaliku tellimuse puhul saab lisada järgmisi faililaienditega dokumente: .pdf, .doc, .docx, .odt, .xls, .xlsx, .png, .rtf, .odt, .ods, .txt, .html, .xml ja .csv. Tõlkeväravas töötab automaatne tekstituvastus vaid masinloetavate failide peal (nt .docx, .rtf., .xlsx jms). Faililaiendiga .pdf, .jpg, .eml, .png vms dokumentide tõlkimiseks peab tõlkekorraldaja/tõlketeenuse osutaja tõlkimiseks tekstifail ise ette valmistama/vormistama. Neid ei saa otse tõlketööriista importida.

**9. Abifailid**  
Tellimusega saab kaasa panna mistahes abimaterjale. Lisatud failile saab määrata soovi korral abifail tüübi: abifail, stiilijuhis või terminibaas. Sõltuvalt asutusest võib abifailide kaasa lisamise kord ja vajadus erineda.
Igal asutusel võib olla kasutusel erinev tööde tellimise kord. Soovitame luua asutusesiseselt enda vajadusele sobiva tellimise süsteemi. 

## Alamtellimused

Alamtellimuste lehel kuvatakse kõiki sisseloginud kasutajaga seotud tellimuste alamtellimusi.
Kui kasutajale on antud juurdepääs, et näha ka asutuse teisi alamtellimusi, siis saab eemaldada linnukese valikust „Soovin näha vaid oma tellimusi“ ja kuvatakse kõiki alamtellimusi.
Lisaks saab alamtellimusi filtreerida ID, keelesuuna, tüübi, staatuse ja maksumuse järgi.

[BREAK]

**Alamtellimuste staatused**  
- Uus – tellija loodud uus tellimus  
- Registreeritud – tõlkekorraldajale töösse registreeritud tellimus  
- Teostajale edastatud (ülesanne) – alamtellimuse ülesanne on saadetud teostajale  
- Teostamisel (ülesanne) – alamtellimuse ülesanne on saadetud teostajale ja see on tema poolt töösse võetud  
- Teostatud (ülesanne) – alamtellimuse ülesanne on teostaja poolt lõpetatuks märgitud  
- Teostatud – kõik alamtellimuse ülesanded on lõpetatuks märgitud  
- Tühistatud – tühistatud tellimus  
- Tellijale edastatud – tellijale saadetud valmis tellimus  
- Tagasi lükatud – tellija poolt tagasi lükatud valmis tellimus  
- Parandatud – tellijale saadetud muudatustega valmis tellimus  
- Vastu võetud – tellija poolt vastu võetud valmis tellimus

## Minu ülesanded

Minu ülesannete lehel kuvatakse kõiki sisseloginud kasutajaga seotud ülesandeid.
Võimalik on vaadata aktiivseid ülesandeid ja ka tehtud ülesannete ajalugu.
Lisaks saab ülesandeid filtreerida keelesuuna ja tüübi järgi.

## Tellimuse detailide muutmine

Tõlkekorraldaja rolliga (või vastavate privileegidega) kasutaja saab tellimust ja sellega seotud alamtellimust muuta ja hallata.

**Tellimuse üldandmete muutmine**
* Enne tellimuse töösse panemist peaks kontrollima tellimuse üldandmeid. Soovi korral saab tõlkekorraldaja tellimuse üldandmetes teha järgmisi muudatusi.
* Muuta tellimuse tellijat.
* Muuta vastutavat tõlkekorraldajat.
* Muuta tellimuse tüüpi (teenust).
* Kustutada/lisada lähtefaile.
* Kustutada/lisada abifaile.
* Muuta tellimuse tähtaega.
* Muuta tellimuse viitenumbrit (kokkulepitud viis tellimusi nimetada/nummerdada).
* Muuta tellimuse lähtekeelt ja sihtkeeli.
* Lisada tellimusele asutusepõhiseid silte.
* Muuta tellimuse valdkonda.
* Tellimuse üldandmetes valitud tellimuse tüüp määrab alamtellimuse all kasutatava töövoo (näiteks suulise ja kirjaliku teenuse töövood on erinevate sätetega). Lisaks saab tellimuse lähtekeelt ja sihtkeeli muuta samuti vaid tellimuse üldandmete all.

**Alamtellimuse üldandmete muutmine**
* Alamtellimus(ed) luuakse tellimuse üldandmetes määratud tellimuse tüübi järgi ning üldandmetesse lisatud lähtekeele ja sihtkeel(t)ega. Sõltuvalt valitud teenuse tüübist saab tõlkekorraldaja alamtellimuse all teha järgmist.
* Määrata ja muuta töövoo ülesannete tähtaegasid.
* Kustutada/lisada lähtefaile.
* Lisada teostajate ülesannetele erijuhiseid.
* Valida teksti tõlkimiseks tõlketööriista. Määrata kasutatavad tõlkemälud ja teha nende põhjal tõlkemahuanalüüse.
* Valida teostajate andmebaasist ülesannetele teostajad (tõlkijad, tõlgid, toimetajad, tõlkebürood jt).
* Lisada ülesannetele töömahtu ja töötasu (käsitsi või tõlkemahuanalüüsi järgi).
* Teostajate valmis tööfaile alla laadida, kontrollida ja tellijale suunata. Seda sammu saab ka vahele jätta: sõltuvalt tellimuse tüübi sätetest saadab süsteem teostajate valmisfailid otse tellijale.
 
## Tellimuse tühistamine

Tellimust saab tühistada tellimuse vaates klõpsates nuppu „Tühista tellimus“.
Kui tellimus on tühistamise hetkel juba teostamisel, siis võib tekkida vajadus pooliku töö eest teostaja(te)le tasuda. Tühistamisel tuleks märkida ära tühistamise põhjus ja klõpsata „Jah, tühista“. Tühistatud tellimus tähistatakse staatusega „Tühistatud“. Teade tühistamise kohta koos tühistamise põhjendusega saadetakse tõlkekorraldajale. Tühistatud tellimust saab 3 kuud pärast tühistamist taastada. Kolme kuu möödumisel tuleb sama töö uuesti tellimiseks luua uus tellimus.

## Tellimuse vastuvõtmine (tellija)
Kui tellimus on valmis, siis saab tellija selle kohta Tõlkeväravast teate pealkirjaga „Tellimus vastuvõtmiseks valmis“. Valmis tellimuse faili(d) saab alla laadida tellimusega seotud alamtellimuse sektsioonist „Valmisfailid teostajatelt“. Lisaks on vaja tellimus heaks kiita klõpsates nupule „Võta vastu“. Seejärel on tellimus lõplikult valmis ja sellega seotud alamtellimused ja ülesanded suletakse.

Kui tellija soovib tellimuse tõlkekorraldajale/tõlkijale/toimetajale tagasi saata, siis saab tellimuse tagasi lükata klõpsates nupule „Lükka tagasi“. Seejärel tuleb valida alamtellimus(ed), mida soovitakse tagasi lükata. Hea oleks juurde lisada ka lühike tagasilükkamise põhjendus ja kirjeldus, mida on vaja teisiti teha. Juhul kui tellijal on kaasa panna alamtellimusega seotud tagasisidefail, siis saab ka selle juurde lisada.

Tellimuse tagasilükkamise teade saadetakse tõlkekorraldajale. Vajadusel võtab tõlkekorraldaja tellijaga eraldi ühendust. Kui tellimust on vastavalt tellija tagasisidele muudetud ja see on valmis, siis saadetakse tellijale uuesti teade pealkirjaga „Tellimus vastuvõtmiseks valmis“. Tellimus loetakse lõpetatuks ning sellega seotud alamtellimused ja ülesanded suletakse kui see vastu võetakse.



## Teostajate andmebaas

Teostajate andmebaasis kuvatakse kõik asutuse kasutajad, kes on teostajate andmebaasi lisatud. Uute teostajate süsteemi lisamiseks või olemasolevate teostajate eemaldamiseks klõpsa menüüst „Teostajate andmebaas“ nupule „Lisa/eemalda teostajaid“.

Iga teostaja konto andmete vaates saab hallata temaga seotud hinnakirja ja temaga kokkulepitud analüüsipõhist soodustuse tabelit. Teostajale saab lisada ka silte ja  kommentaare. Teostaja ise enda kontole lisatud silte ja kommentaare ei näe. Need on mõeldud asutusesiseseks kasutamiseks (eelkõige tõlkekorraldajale). Lisaks saab teostaja andmete alt vaadata temaga seotud aktiivseid ülesandeid.

Tõlkevärava kasutajate kontod on seotud kasutaja pärisnimega ja tema isikukoodiga. Teostajate andmebaasi lisatud kasutajatele on võimalik lisada ka „Lepingupartneri ärinimi“. Kui teenust osutab asutuse väline partner (nt FIE, OÜ, vms) mitte eraisik või põhikohaga töötaja, siis soovitame teostajale lisada ka ärinime või viite koostöövormile. Kui asutus kasutab hankepartnerist tõlkebürood, siis soovitame hankepartneri töötajatele (tõlkebüroo tõlkekorraldajatele või projektijuhtidele) Tõlkeväravasse eraldi kontod luua ja nad kasutajate ja ka teostajate andmebaasi lisada.

[BREAK]

**Teostaja hinnakirja seadistamine**  
Teostaja oskuste ja hindade sisestamiseks tuleb avada tema üldandmete vaade ja menüüst „Hinnakiri“ klõpsata nupule „+ lisa keelesuund“.
1. Esmalt tuleb valida keelepaar, millele soovitakse oskust(teenust) lisada. Valida saab ühe lähtekeele ja ühe või mitu sihtkeelt. Valides rohkem kui ühe sihtkeele tuleb arvestada, et valitud keeltele saad sisestada ühed ja samad hinnad. Kui soovid igale keelepaarile sisestada erinevad ühiku hinnad, siis tuleb iga keelepaar sisestada eraldi.
2. Järgmiseks saab valitud keelepaari(de)le määrata oskused.
3. Viimaseks saab oskus(t)ele määrata ühikupõhised tasud. Juhul, kui mõnda arvestusühikut selle teostaja puhul ei kasutata või puudub kokkulepitud hind, siis võib jätta selle ühiku hinnaks nulli.

**Analüüsipõhine soodustus**  
Ühiku tasud ja tasustamise kord võib asutustes erineda. Kui teie asutus soovib enamuse enda tellimustest tõlkida kasutades tõlketööriista (sh kasutades tõlkemälusid ja tõlkemahuanalüüsi soodustusi), siis soovitame kõikide teostajatega kokku leppida ja hinnakirjades seadistada sõnapõhise ühikuarvestuse. Tõlkevärava tõlkemälupõhine tõlkemahuanalüüs ei kalkuleeri ega kuva lähteteksti(de) mahtu tähemärgi ja lehekülje põhiselt.

Tõlkemälu kasutamisest ja selle pealt hinnasoodustuse arvutamise põhimõtetest saab juurde lugeda Tõlkevärava Wiki artiklist „Tõlketööde hankimise parimad praktikad ning põhimõtted“: https://github.com/keeleinstituut/tv-tolkevarav/wiki/T%C3%B5lket%C3%B6%C3%B6de-hankimise-parimad-praktikad-ning-p%C3%B5him%C3%B5tted#t%C3%B5lkimisest-%C3%BCldiselt

## Koondhinnakiri
Koondhinnakirja vaates saab filtreerida teostajaid keelte, oskuste, nimede ja nende hindade järgi.

## Ülesanded
Siin kuvatakse selle kasutajaga seotud ülesandeid.

## Tõlkemälud
Tõlkemälude nimekirjas kuvatakse kõiki asutuse siseseid, asutustega jagatud ja avalikke tõlkemälusid.
Tõlkemälusid saab filtreerida järgmiste parameetrite järgi: nimetus, sildid, valdkond ja keelesuund.

Tõlkevärava tõlkemälud on kolme erineva kasutuspiiranguga:  
- „Asutuste sisene“ – tõlkemälu on jagatud ainult asutuse kasutajatega, kelle roll lubab mälusid vaadata, hallata ja/või kasutada;
- „Asutustega jagamiseks“ – tõlkemälu on jagatud ka teiste avaliku sektori asutuste kasutajatega, kelle roll lubab mälusid vaadata, hallata ja/või kasutada;
- „Avalik“ – tõlkemälu on jagatud kõikide Tõlkevärava kasutajatega.

**Tõlkemälu haldamine**  
Tõlkemälu täpsemate andmete vaatamiseks ja haldamiseks tuleb klõpsata tõlkemälu nimetusele. Muuta saab tõlkemälu nime, silte, kasutust, valdkonda ja kommentaare. Tõlkemällu saab salvestada tõlkeid kahel järgmisel moel.
1. Tõlkemälusse saab salvestada väljaspool Tõlkeväravat koostatud tõlkemälu. Selleks tuleb avada tõlkemälu või luua uus mälu ja tõlkemälu .tmx failina sellesse importida.
2. Lisades tõlkemälu alamtellimusele „Peamine/Kirjuta“ mäluna salvestatakse selle alamtellimuse tõlkesegmendid sellesse tõlkemällu. Tõlkemälu üldandmete vaates kuvatakse mäluga seotud alamtellimused, milliste tellimuse tõlked on sellesse tõlkemällu salvestatud.

[BREAK]

**Märkus.** Avaliku ja jagatud kasutuspiiranguga tõlkemälu andmeid kuvatakse kõikidele Tõlkevärava kasutajatele, kelle roll lubab mälusid vaadata, hallata ja/või kasutada. St kuvatakse kasutajatele mälu ID, nimi, valdkond, keelesuund, segmentide arv, loomise aeg ja kommentaar.

Tõlkemälude kasutamisest saab juurde lugeda Tõlkevärava Wiki artiklist „Tõlketööde hankimise parimad praktikad ning põhimõtted“: https://github.com/keeleinstituut/tv-tolkevarav/wiki/T%C3%B5lket%C3%B6%C3%B6de-hankimise-parimad-praktikad-ning-p%C3%B5him%C3%B5tted#t%C3%B5lkimisest-%C3%BCldiselt

## Tõlketööriista mahuanalüüs

Tõlketööriistas saab lähteteksti mahtu sõnapõhiselt analüüsida. Analüüsitakse lähteteksti tekstisisest kattuvust ja ka kattuvusi tõlkemäludega. Analüüsi põhjal saab tõlkimise tasu arvestada ja hinnata tõlkimiseks planeeritavat töökiirust.

**Mahuanalüüs**  
Sõnade, fraaside ja lausete eest, mille vasted on osalise kattuvusega võimaldab tõlke-eelarve pealt kokku hoida. Tõlkemälu kasutamisel võiks hinnasoodustuse arvutamisel kasutada järgnevat mudelit.

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
Keskmine tõlkimiskiirus on umbes 200 kuni 300 sõna tunnis ja 1500 kuni 2500 sõna päevas. Täpne päevane tõlkemaht sõltub teksti olemusest ja keerukusest.

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


## Tellimuste aruande eksport

Tellimuste statistikat saab teha väljaspool Tõlkeväravat. Selleks saab süstemist alla laadida aruande tellimuste andmetest. Valida saab perioodi, millal tellimused on Tõlkeväravasse sisestatud ja mis staatusega need valitud perioodi tellimused on. Jättes staatuse valimata, lisatakse aruandesse kõiki tellimused olenemata sellest kas need on tühistatud, vastuvõetud või mõnes muus staatuses.

[BREAK]

## Sildid
Asutus saab võtta kasutusele enda vajaduste järgi kohandatud siltide süsteemi, mis aitab tõlkeid paremini korraldada. Siltide kategooriaid on neli: oskused, teostajad, tõlkemälud ja tellimused.  

**Oskused**  
Need sildid on seotud töövoogudega ning teostajate andmebaasi lisatud teostajate oskuste ja hinnakirjadega.  
**Tellimus**  
Tellimustele saab lisada silte, mis aitavad kasutajaid tõlketellimuste haldamisel ja siltide järgi tellimusi otsida ja filtreerida.  
**Teostaja**  
Teostajatele saab lisada silte, mis aitavad kasutajaid teostajate andmebaasis siltide järgi teostajaid otsida ja filtreerida.  
**Tõlkemälud**  
Tõlkemäludele saab lisada silte, mis aitavad kasutajaid tõlkemälude haldamisel ja siltide järgi tõlkemälusid otsida ja filtreerida.

[BREAK]

* **Oskuste** all on loetelu teenustest, mida teostajad osutavad. Oskuseid saab teostajate andmebaasi lisatud kasutajatele nende andmete seadistamisel/muutmisel külge lisada. Oskuste põhjal saav teostajatele hinnakirju luua. Oskuseid ei saa juurde luua, muuta ega kustutada.
* **Tellimusega** seotud siltide funktsionaalsus lubab tellimustele lisada asutuse põhiseid märkeid. See võimaldab asutusel kasutusele võtta tellimuste haldamiseks endale sobiva märkide süsteemi.
* **Teostajatega** seotud siltide funktsionaalsus lubab teostaja andmebaasi lisatud kasutajatele lisada asutuse põhiseid märkeid. See võimaldab asutusel kasutusele võtta teostajate andmebaasi haldamiseks endale sobiva märkide süsteemi.
* **Tõlkemäludega** seotud siltide funktsionaalsus lubab tõlkemäludele lisada asutuse põhiseid märkeid. See võimaldab asutusel kasutusele võtta tõlkemälude haldamiseks endale sobiva märkide süsteemi.
 
Silte saab hallata kasutaja, kelle rollile on lisatud järgmised privileegid: „Siltide lisamine“, „Siltide muutmine“ ja/või „Siltide eemaldamine“. Kasutajarollide privileege saab seadistada menüüst „Rollihaldus“.

## Asutuse andmete haldamine

Asutuse sätetes saab muuta järgmisi üldandmeid: asutuse nimetus, asutuse lühend, meiliaadress, telefoninumber. Tõlkevärav kasutab asutuse lühendit tellimustele numbri loomisel.

**Tööajad ja puhkepäevad**  
Asutuse üldandmetes saab määrata ja muuta asutuse tööaegu ja puhkepäevasid. Asutuse tööajad ja puhkepäevad määratakse vaikimisi ka kõikidele asutuse kasutajate. Soovi korral saab kasutaja andmete all neid muuta.

**Üksused**  
Asutuse üldandmete all saab luua ja muuta asutuse üksuseid. Asutuse üksuseid saab kasutada asutuse kasutajate kontaktandmetes.

[BREAK]

## Asutuse ülesed süsteemi sätted

Asutuse ülestes sätetes saab hallata tõlkeanalüüsipõhist soodustuste tabelit. Analüüsipõhise soodustuse protsendid võetakse üle vaikeväärtusena teostajate hinnakirjadesse. Kui asutuse analüüsipõhine soodustuse tabel on kinnitatud, siis võib selle alusel luua teostajatele hinnakirjad.

**Märkus.** Kui muuta asutuse üleseid soodustuse protsente pärast teostajate hinnakirjade loomist, siis see ei kirjuta tagasiulatuvalt teostajatele juba loodud hinnakirja soodustusprotsente üle.

[BREAK]

Võimalik on ka asutusepõhisest soodustustes teistsugust soodustuse süsteemi kokku leppida. Iga teostaja andmetes saab määrata kasutajale teistsugused protsendid (% hinnast = makstav tasu teostajaga kokkulepitud ühiku täishinnast). Lisaks saab üksikute tellimuste all kokkuleppel teostajatega makstavate tasude andmetes soodustuse protsente käsitsi muuta. Asutuase tõlkeanalüüsipõhine soodustuste tabel on vaikeväärtusena süsteemis kasutusel.  
Tõlkemälu kasutamisest ja selle pealt hinnasoodustuse arvutamise põhimõtetest saab rohkem lugeda Tõlkevärava Wikist: https://github.com/keeleinstituut/tv-tolkevarav/wiki/T%C3%B5lket%C3%B6%C3%B6de-hankimise-parimad-praktikad-ning-p%C3%B5him%C3%B5tted#t%C3%B5lkimisest-%C3%BCldiselt 
 
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

Logisid säilitatakse kuni 6 kuud.

[BREAK]

`

module.exports = manualsText
