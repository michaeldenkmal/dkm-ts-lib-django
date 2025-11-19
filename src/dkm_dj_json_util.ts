// serialization
// benötigt yarn add decimal.js
import Decimal from "decimal.js";

// decimal -> json
export function dkmDecimalToJson(dec:Decimal|null|undefined):string {
    // :E~:zahlen wert::
    if (!dec) {
        return "null";
    }
    return `:E~:${dec?.toString()}:`
}
// date -> json
// dateUtil.DateUtil.
// deserialization
// json-> decimal
export function dkmJsonToDecimal(jsonExpr:string):Decimal|null{
    /**
     * Kodiertes Decimal Format: :E~:13.5099:
     * Werte ohne Komma => :E~:13:
     */
    const pattern = /:E~:(\S+):/;
    const match = jsonExpr.match(pattern);

    if (match && match.length > 1) {
        const strDecimalValue = match[1];
        const numValue = new Decimal(strDecimalValue);
        return numValue;
    } else {
        return null;
    }
}
// json->Date
/*
Date.prototype.toJSON = function(_key?: any) {
    return dateToDkmDateStr((this as Date));
};

Decimal.prototype.toJSON = function(_key?: any) {
    return dkmDecimalToJson((this as Decimal));
}
 */