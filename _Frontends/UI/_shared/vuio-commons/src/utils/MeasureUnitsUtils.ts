import engine from "cohtml/cohtml"
import { replaceArgs } from "./name.utils"

export enum TimeFormat {
    TwentyFourHours,
    TwelveHours
}

export enum TemperatureUnit {
    Celsius,
    Fahrenheit,
    Kelvin
}

export enum UnitSystem {
    Metric,
    Freedom
}

export type ValuableObject<T> = {
    value__: T
}

export type UnitSettings = {
    timeFormat: ValuableObject<TimeFormat>
    temperatureUnit: ValuableObject<TemperatureUnit>
    unitSystem: ValuableObject<UnitSystem>
}

export const FRAMES_EACH_DAY = 262144;

export function durationToGameMinutes(val: number) {
    return val * 60 / FRAMES_EACH_DAY * 1440;
}

export function setupSignificance(val: number, digits: number): string {
    return val.toFixed(Math.max(0, digits - val.toFixed(0).length))
}

export function kilogramsTo(value: number, unit: UnitSystem, perMonth: boolean = false): [string, Record<string, string>] {
    const keyPath = perMonth ? "monthly" : "linear";
    const unitArr = MetricUnitsEntries.mass[keyPath][unit];
    switch (unit) {
        case UnitSystem.Freedom:
            if (value > 910) {
                const val = kilogramToShortTon(value);
                return [unitArr[1], { VALUE: setupSignificance(val, 3) }]
            } else {
                return [unitArr[0], { VALUE: kilogramToPounds(value).toFixed(0) }]
            }
        default:
            if (value > 1000) {
                const val = kilogramToTon(value);
                return [unitArr[1], { VALUE: setupSignificance(val, 3) }]
            } else {
                return [unitArr[0], { VALUE: value.toFixed(0) }]
            }
    }
}


export function metersTo(value: number, unit: UnitSystem): [string, Record<string, string>] {
    const unitArr = MetricUnitsEntries.distance.linear[unit];
    switch (unit) {
        case UnitSystem.Freedom:
            if (value > 1610) {
                const val = meterToMile(value);
                return [unitArr[2], { VALUE: setupSignificance(val, 3) }]
            } else if (value > 33) {
                const val = meterToYard(value);
                return [unitArr[1], { VALUE: setupSignificance(val, 3) }]
            } else {
                return [unitArr[0], { VALUE: meterToFoot(value).toFixed(0) }]
            }
        default:
            if (value > 1000) {
                const val = meterToKilometer(value);
                return [unitArr[1], { VALUE: setupSignificance(val, 3) }]
            } else {
                return [unitArr[0], { VALUE: value.toFixed(0) }]
            }
    }
}


export function squareMetersTo(value: number, unit: UnitSystem, perMonth: boolean = false): [string, Record<string, string>] {
    const keyPath = perMonth ? "monthly" : "linear";
    const unitArr = MetricUnitsEntries.mass[keyPath][unit];
    switch (unit) {
        case UnitSystem.Freedom:
            if (value > 4050) {
                const val = squareMeterToAcres(value);
                return [unitArr[1], { VALUE: setupSignificance(val, 3) }]
            } else {
                return [unitArr[0], { VALUE: squareMeterToSquareFoot(value).toFixed(0) }]
            }
        default:
            if (value > 1000) {
                const val = squareMeterToSquareKilometer(value);
                return [unitArr[1], { VALUE: setupSignificance(val, 3) }]
            } else {
                return [unitArr[0], { VALUE: value.toFixed(0) }]
            }
    }
}

export function cubicMetersTo(value: number, unit: UnitSystem, perMonth: boolean = false): [string, Record<string, string>] {
    const keyPath = perMonth ? "monthly" : "linear";
    const unitArr = MetricUnitsEntries.mass[keyPath][unit];
    switch (unit) {
        case UnitSystem.Freedom:
            return [unitArr[0], { VALUE: cubicMeterToGallons(value).toFixed(0) }]
        default:
            return [unitArr[0], { VALUE: value.toFixed(0) }]

    }
}

export function translateUnitResult(input: [string, Record<string, any>]) {
    return replaceArgs(engine.translate(input[0]), { ...input[1], "SIGN": "" })
}

export const MetricUnitsEntries = {
    volume: {
        linear: {
            [UnitSystem.Freedom]: ["Common.VALUE_GALLON"],
            [UnitSystem.Metric]: ["Common.VALUE_CUBIC_METER"],
        },
        monthly: {
            [UnitSystem.Freedom]: ["Common.VALUE_GALLON_PER_MONTH"],
            [UnitSystem.Metric]: ["Common.VALUE_CUBIC_METER_PER_MONTH"],
        }
    },
    area: {

        linear: {
            [UnitSystem.Freedom]: ["Common.VALUE_SQUARE_FOOT", "Common.VALUE_ACRE"],
            [UnitSystem.Metric]: ["Common.VALUE_SQUARE_METER", "Common.VALUE_SQUARE_KILOMETER"],
        },
        monthly: {
            [UnitSystem.Freedom]: ["Common.VALUE_SQUARE_FOOT_PER_MONTH", "Common.VALUE_ACRE_PER_MONTH"],
            [UnitSystem.Metric]: ["Common.VALUE_SQUARE_METER_PER_MONTH", "Common.VALUE_SQUARE_KILOMETER_PER_MONTH"],
        }
    },
    distance: {
        linear: {
            [UnitSystem.Freedom]: ["Common.VALUE_FOOT", "Common.VALUE_YARD", "Common.VALUE_MILE"],
            [UnitSystem.Metric]: ["Common.VALUE_METER", "Common.VALUE_KILOMETER"],
        }
    },
    mass: {
        linear: {
            [UnitSystem.Freedom]: ["Common.VALUE_POUND", "Common.VALUE_SHORT_TON"],
            [UnitSystem.Metric]: ["Common.VALUE_KILOGRAM", "Common.VALUE_TON"],
        },
        monthly: {
            [UnitSystem.Freedom]: ["Common.VALUE_POUND_PER_MONTH", "Common.VALUE_SHORT_TON_PER_MONTH"],
            [UnitSystem.Metric]: ["Common.VALUE_KILOGRAM_PER_MONTH", "Common.VALUE_TON_PER_MONTH"],
        }
    }
}

export async function getGameUnits(): Promise<UnitSettings> {
    return engine.call("k45::euis.getUnits")
}


function celsiusToFarenheit(e: number) { return 9 * e / 5 + 32 }
function celsiusToKelvin(e: number) { return e + 273.16 }
function cubicMeterToGallons(e: number) { return 264.172 * e }
function kilogramToPounds(e: number) { return e / .45359237 }
function kilogramToShortTon(e: number) { return e / 907.18474 };
function kilogramToTon(e: number) { return e / 1000 };
function squareMeterToSquareFoot(e: number) { return e / .092903 };
function squareMeterToAcres(e: number) { return e / 4046.873 };
function squareMeterToSquareKilometer(e: number) { return e / 1_000_000 };
function meterToFoot(e: number) { return e / .3048 };
function meterToYard(e: number) { return e / .9144 };
function meterToMile(e: number) { return e / 1609.344 };
function meterToKilometer(e: number) { return e / 1_000 };
/**
 * 
 */

