class model {

    constructor() {
        this.url= "https://api.covid19api.com/summary"
    }

    setDB(db) {
        let t = Date.now()

        let p = new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.onerror = (() => {
                reject("Erreur !")
            })
            xhr.ontimeout = (() => {
                reject("Timeout !")
            })

            xhr.responseType = "json"
            xhr.timeout = 1000
            xhr.onload = function() {
                resolve
                    (
                        this.response
                    )
            }
            xhr.open("GET", "https://api.covid19api.com/summary", true);
            xhr.send();
        })

        p
            .then((res) => {
                console.log("data received from API")
                if(db.isNew()) {
                    console.log("---------- New database ----------")
                    console.log("---------- Creating database tables ----------")
                    db.createTable("global", ["date", "newConf", "newDeaths", "newRecov", "totalConf", "totalDeaths", "totalRecov"]);
                    db.createTable("pays", ["nom", "date", "conf", "recov", "deaths", "totalConf", "totalRecov" , "totalDeaths"]);
                    db.commit();
                    console.log("---------- Database tables created ----------")

                    for(let i = 0; i < res.Countries.length; i++) {

                        db.insert("pays", {
                            nom: res.Countries[i].Country,
                            date: res.Countries[i].Date,
                            conf: res.Countries[i].NewConfirmed,
                            recov: res.Countries[i].NewRecovered,
                            deaths: res.Countries[i].NewDeaths,
                            totalConf: res.Countries[i].TotalConfirmed,
                            totalRecov: res.Countries[i].TotalRecovered,
                            totalDeaths: res.Countries[i].TotalDeaths
                        })

                    }

                    console.log("---------- Rows inserted for table 'pays' ----------")

                    db.insert("global", {
                        date: res.Date,
                        newConf: res.Global.NewConfirmed,
                        newDeaths: res.Global.NewDeaths,
                        newRecov: res.Global.NewRecovered,
                        totalConf: res.Global.TotalConfirmed,
                        totalDeaths: res.Global.TotalDeaths,
                        totalRecov: res.Global.TotalRecovered
                    })

                    console.log("---------- Rows inserted for table 'global' ----------")

                    db.commit();

                    console.log("---------- Rows inserted ----------")
                } else {
                    console.log("---------- Database found ----------");
                    console.log(db.queryAll("global")[0].date)
                    let ancienne = new Date(db.queryAll("global")[0].date)
                    let actu = new Date()
                    console.log("---------- Date set ----------")
                    if(actu.getTime()-ancienne.getTime() >= 21600000) {
                        console.log("---------- Last API refresh more than 6 hours ----------")
                        db.dropTable("global")
                        db.commit()
                        db.createTable("global", ["date", "newConf", "newDeaths", "newRecov", "totalConf", "totalDeaths", "totalRecov"])

                        db.insert("global", {
                            date: res.Date,
                            newConf: res.Global.NewConfirmed,
                            newDeaths: res.Global.NewDeaths,
                            newRecov: res.Global.NewRecovered,
                            totalConf: res.Global.TotalConfirmed,
                            totalDeaths: res.Global.TotalDeaths,
                            totalRecov: res.Global.TotalRecovered
                        })
                        db.commit();

                        console.log("---------- Table global has been reset ----------")

                        db.dropTable("pays")
                        db.commit()
                        db.createTable("pays", ["nom", "date", "conf", "recov", "deaths", "totalConf", "totalRecov" , "totalDeaths"])

                        for(let i = 0; i < res.Countries.length; i++) {

                            db.insert("pays", {
                                nom: res.Countries[i].Country,
                                date: res.Countries[i].Date,
                                conf: res.Countries[i].NewConfirmed,
                                recov: res.Countries[i].NewRecovered,
                                deaths: res.Countries[i].NewDeaths,
                                totalConf: res.Countries[i].TotalConfirmed,
                                totalRecov: res.Countries[i].TotalRecovered,
                                totalDeaths: res.Countries[i].TotalDeaths
                            })

                        }
                        db.commit()
                        console.log("---------- Table pays has been reset ----------")
                    } else {
                        console.log("---------- Last API refresh : less than 6 hours ----------")
                    }
                }

                db.commit();
                console.log("data sent")
            })
            .catch((res) => {

            })
    }
}