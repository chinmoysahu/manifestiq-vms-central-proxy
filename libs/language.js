module.exports = (config) => {
    const selectedLanguage = config.lang || `en_CA`;
    try{
        return require(`../languages/${selectedLanguage}.js`);
    }catch(err){
        console.error(`Language not found! : ${selectedLanguage}`);
        console.error(`Using en_CA...`);
        return require(`../languages/en_CA.js`);
    }
}
