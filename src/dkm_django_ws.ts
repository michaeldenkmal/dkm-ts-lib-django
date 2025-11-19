// csrf
import {dateToDkmDateStr, dkmDateJson2Date} from "@at.dkm/dkm-ts-lib-gen/lib/dateUtil";
import Decimal from "decimal.js";
import {dkmDecimalToJson, dkmJsonToDecimal} from "./dkm_dj_json_util";
import {HtmlError} from "@at.dkm/dkm-ts-lib-gen/lib/html_error";


const CSRF_TOKEN = "csrftoken"

// csrf.ts
export async function ensureCsrfToken(hostroot: string): Promise<string> {
    let ret = getCookie(CSRF_TOKEN)
    if (!ret) {
        await fetch(hostroot + "/api/csrf/", {credentials: "include"});
        const token = getCookie(CSRF_TOKEN);
        if (!token) {
            throw new Error(`konnte Token ${CSRF_TOKEN} nicht laden`)
        }
        return token;
    }
    return ret;
}

export function getCsrfTokenOrFail(): string {
    const token = getCookie(CSRF_TOKEN);
    if (!token) {
        throw Error(`${CSRF_TOKEN} nicht in Cookies gefunden`)
    }
    return token;
}

function getCookie(name: string): string | null {
    const cookieStr = document.cookie;
    const cookies = cookieStr ? cookieStr.split("; ") : [];
    for (let i = 0; i < cookies.length; i++) {
        const [key, value] = cookies[i].split("=");
        if (key === name) {
            return decodeURIComponent(value);
        }
    }
    return null;
}

export interface DateAndDecimalFields {
    date_fields: Array<string>
    decimal_fields: Array<string>
}


export interface DkmDjJsonResult extends DateAndDecimalFields {
    rows: Record<string, any>[];
}

export function decodeJsonResRow(dndf: DateAndDecimalFields, row: Record<string, any>): void {
    Object.keys(row).forEach(key => {
        if (dndf.date_fields && dndf.date_fields.includes(key)) {
            row[key] = new Date(row[key]);
        }
        if (dndf.decimal_fields && dndf.decimal_fields.includes(key)) {
            row[key] = parseFloat(row[key]);
        }
    })
}

// function jsonResToTypeArr<T>(jsres: DkmDjJsonResult): T | null {
//     if (jsres && jsres.rows && jsres.rows.length > 0 &&
//         (jsres.date_fields || jsres.decimal_fields)) {
//
//         jsres.rows.forEach(row => {
//             decodeJsonResRow(jsres, row)
//         })
//         return jsres.rows as any as T;
//     }
//     return null
// }

/*
function stringifyReplacer(_key: any, value: any): any {
    if (value instanceof Date) {
        try {
            return dateToDkmDateStr(value);
        } catch (e) {
            throw Error(`stringifyReplacer->dateToDkmDateStr:${e}´, key=${_key}, value=${value}`);
        }
    } else if ((value instanceof Decimal)) {
        try {
            return dkmDecimalToJson(value);
        } catch (e) {
            throw Error(`stringifyReplacer->dkmDecimalToJson:${e}´, key=${_key}, value=${value}`);
        }
    }
    return value;
}
*/

const date_prototype_toJSON = function (this: Date, _key?: any) {
    return dateToDkmDateStr(this);
};

const decimal_prototype_toJSON = function (this: Decimal, _key?: any) {
    return dkmDecimalToJson(this);
}


export function obj2DkmDateDec(data: any): string {
    let storeToJSONDate;
    let storeToJSONDecimal;
    try {
        storeToJSONDate = Date.prototype.toJSON;
        Date.prototype.toJSON = date_prototype_toJSON;
        //delete (Date as any).prototype.toJSON;
        storeToJSONDecimal = Decimal.prototype.toJSON;
        //delete (Decimal as any).prototype.toJSON;
        Decimal.prototype.toJSON = decimal_prototype_toJSON;
        return JSON.stringify(data, null, 4);
    } catch (e) {
        throw e;
    } finally {
        Date.prototype.toJSON = storeToJSONDate;
        Decimal.prototype.toJSON = storeToJSONDecimal;
    }

}


export async function execDjPost<T>(url: string, data: any): Promise<T> {
    const csrfToken = getCsrfTokenOrFail();
    const jsonData = obj2DkmDateDec(data);
    const errmsginfo = `url=${url}, data=${jsonData}`;
    try {
        const res = await fetch(url, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken || "",
            },
            body: jsonData,
        });
        if (!res.ok) {
            const resText = await res.text();
            console.error("err1:" +  errmsginfo);
            throw new HtmlError(`post:url=${url}, data:=${JSON.stringify(data)}`, resText);
        }
        const resText = await res.text();
        return djParseJson(resText);

    } catch (e) {
        if (e instanceof HtmlError) {
            throw e
        } else {
            const errmsg = errmsginfo + `${e}`
            throw Error("err2:" + errmsg);
        }
    }
}

function djParseJson(jsonstr: string): any {
    return JSON.parse(jsonstr, (_key, value: any): any => {
        // wandelt ISO-Datumsstrings in Date um
        if (typeof value == "string") {
            const szv = value.toString()
            if (szv.startsWith(":d~")) {
                // TODO
                return dkmDateJson2Date(szv);
            } else if (szv.startsWith(":E~:")) {
                // TODO
                return dkmJsonToDecimal(szv);
            }
        }
        return value;
    });
}

export async function execDjGet<T>(url: string): Promise<T> {
    const errmsginfo = `url=${url}`;
    try {
        const res = await fetch(url, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            }
        });
        if (!res.ok) {
            const resText = await res.text();
            console.error("err1:" +  errmsginfo);
            throw new HtmlError(`post:url=${url}`, resText);
        } else {
            const resText = await res.text();
            return djParseJson(resText);
        }
    } catch (e) {
        if (e instanceof HtmlError) {
            throw e
        } else {
            const errmsg = errmsginfo + `${e}`
            throw Error("err2:" + errmsg);
        }
    }
}
