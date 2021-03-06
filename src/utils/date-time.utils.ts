import * as _ from 'lodash';
import * as moment from 'moment';
import { TimeFrames } from '../models/timeFrames';

export class DateTimeUtils {
    public static MONDAY = 'monday';
    public static TUESDAY = 'tuesday';
    public static WEDNESDAY = 'wednesday';
    public static THURSDAY = 'thursday';
    public static FRIDAY = 'friday';
    public static SATURDAY = 'saturday';
    public static SUNDAY = 'sunday';

    public static ALL_DAYS = [
        DateTimeUtils.MONDAY,
        DateTimeUtils.TUESDAY,
        DateTimeUtils.WEDNESDAY,
        DateTimeUtils.THURSDAY,
        DateTimeUtils.FRIDAY,
        DateTimeUtils.SATURDAY,
        DateTimeUtils.SUNDAY
    ];
    public static ZERO_TIME_SUFFIX = ':00.000000';
    public static ZERO_START_DATETIME_SUFFIX = ' 00:00:00.000000';
    public static ZERO_FINISH_DATETIME_SUFFIX = ' 23:59:59.999999';

    static getTimezone(timezoneData) {
        let timezone = (timezoneData.dstOffset + timezoneData.rawOffset) / 3600;
        let timezoneStr = DateTimeUtils.timezoneToStr(timezone);
        return {
            timezone: timezone,
            timezoneStr: timezoneStr
        };
    }

    static getFilterDates(date: string) {
        let timezone = -1 * (new Date().getTimezoneOffset() / 60);
        let timezoneStr = DateTimeUtils.timezoneToStr(timezone);
        let start = new Date(date).getTime() - (24 * 60 * 60 * 1000);
        //let startDate = encodeURIComponent(new Date(start).toISOString().slice(0, 10) + ' 23:59:59.999999' + timezoneStr);
        let startDate = new Date(start).toISOString().slice(0, 10) + ' 23:59:59.999999' + timezoneStr;
        let finish = new Date(date).getTime() + (24 * 60 * 60 * 1000);
        //let finishDate = encodeURIComponent(new Date(finish).toISOString().slice(0, 10) + ' 00:00:00.000000' + timezoneStr);
        let finishDate = new Date(finish).toISOString().slice(0, 10) + ' 00:00:00.000000' + timezoneStr;
        return { startDate, finishDate };
    }

    static timezoneToStr(timezone) {
        let timezoneStr = (timezone < 0)
            ? ('-0' + Math.abs(timezone) + '00')
            : ('+0' + Math.abs(timezone) + '00');
        return timezoneStr;
    }

    static groupTimeframes(timeframesData: TimeFrames[], simpleTimeFrames, timezone: number) {
        let startTime: string;
        let finishTime: string;
        let isWorkingDays = false;
        let isWeekend = false;
        let isDetailedSettingsVisible = timeframesData.length == 0 ? false : true;
        let timeFrames = _.flatMap(timeframesData, function (obj) {
            return _.map(obj.days, function (day) {
                return {
                    from: DateTimeUtils.returnTime(obj.from, timezone),
                    to: DateTimeUtils.returnTime(obj.to, timezone),
                    days: day
                };
            });
        });
        let group = _.groupBy(timeFrames, timeFrame => [timeFrame.from, timeFrame.to]);
        let key = Object.keys(group)[0];
        let arr = group[key];
        if (Object.keys(group).length == 1) {
            startTime = arr[0].from;
            finishTime = arr[0].to;
            isDetailedSettingsVisible = false;
            let days = arr.map(i => i.days);

            if (arr.length == 2 && DateTimeUtils.find(days, [this.SATURDAY, this.SUNDAY])) {
                isWeekend = true;
            }
            if (arr.length == 5 && DateTimeUtils.find(days, [this.MONDAY, this.TUESDAY, this.WEDNESDAY, this.THURSDAY, this.FRIDAY])) {
                isWorkingDays = true;
            }
        }

        for (let i = 0; i < simpleTimeFrames.length; i++) {
            for (let j = 0; j < timeFrames.length; j++) {
                let sTF = simpleTimeFrames;
                let tF = timeFrames;
                sTF[i].isSelected = sTF[i].days.slice(0, 2) == tF[j].days;
                sTF[i].from = (sTF[i].days.slice(0, 2) == tF[j].days) ? tF[j].from.slice(0, 5) : '';
                sTF[i].to = (sTF[i].days.slice(0, 2) == tF[j].days) ? tF[j].to.slice(0, 5) : '';
                if (sTF[i].isSelected) {
                    break;
                }
            }
        }
        return {
            startTime: startTime ? startTime.slice(0, 5) : undefined,
            finishTime: finishTime ? finishTime.slice(0, 5) : undefined,
            isWeekend: isWeekend,
            isWorkingDays: isWorkingDays,
            simpleTimeFrames: simpleTimeFrames,
            isDetailedSettingsVisible: isDetailedSettingsVisible
        }
    }

    static find(daysOfFrames, constDays) {
        let days = constDays.map(i => i.slice(0, 2));
        return _.difference(daysOfFrames, days).length === 0;
    }

    static getTime(timeframes: any[]) {
        timeframes = timeframes.filter(i => i.isSelected);
        let groupedStart = _.values(_.groupBy(timeframes, timeFrame => timeFrame.from));
        let startFrame = groupedStart[0];
        let startTime = groupedStart.length == 1 ? startFrame[0].from : '';
        let groupedFinish = _.values(_.groupBy(timeframes, timeFrame => timeFrame.to));
        let finishFrame = groupedFinish[0];
        let finishTime = groupedFinish.length == 1 ? finishFrame[0].to : '';
        return {
            startTime: startTime,
            finishTime: finishTime
        }
    }

    static returnDate(str: string, timezone: number) {
        let currentTime = new Date(str);
        currentTime.setHours(currentTime.getHours() + timezone);
        let date = currentTime.getFullYear() + "-" + ((+currentTime.getMonth() + 1) < 10
            ? ('0' + (+currentTime.getMonth() + 1))
            : (+currentTime.getMonth() + 1)) + "-" + ((+currentTime.getDate()) < 10
                ? ('0' + (+currentTime.getDate())) : (+currentTime.getDate()));
        return date;
    }

    static returnTime(time: string, timeOffset) {
        let date = new Date('August 19, 1975' + ' ' + time.split(':')[0] + ':' + time.split(':')[1] + ':00');
        let offsetInMinutes = timeOffset / 60;
        date.setMinutes(date.getMinutes() + offsetInMinutes);
        let hour = date.getHours();
        let minutes = date.getMinutes();
        let hourStr = (hour < 10 ? '0' + hour : hour) + ':' + (minutes < 10 ? '0' + minutes : minutes);
        return hourStr;
    }

    static getOfferTimeframes(timeframesData: TimeFrames[], timeOffset: number) {
        let date = new Date();
        let offerDate = moment().utcOffset(timeOffset / 60).format("dddd, DD MMMM YYYY, HH:mm:ss");
        let offerDay = offerDate.split(',')[0].toLowerCase();
        let timeFrames: any = _.flatMap(timeframesData, function (obj) {
            return _.map(obj.days, function (day) {
                return {
                    from: obj.from,
                    to: obj.to,
                    day: day
                };
            });
        });
        // let day = timeFrames.find(item => item.day === this.ALL_DAYS[date.getUTCDay() - 1].slice(0, 2));
        let day = timeFrames.find(item => item.day === offerDay.slice(0, 2));
        let isIncluded: boolean;
        if (day) {
            let timeInMinutes = date.getUTCHours() * 60 + date.getUTCMinutes();
            let fromInMinutes = parseInt(day.from.split(':')[0]) * 60 + parseInt(day.from.split(':')[1].slice(0, 2));
            let toInMinutes = parseInt(day.to.split(':')[0]) * 60 + parseInt(day.to.split(':')[1].slice(0, 2));
            // console.log({ date: date, offerDate: offerDate, timeInMinutes: timeInMinutes, fromInMinutes: fromInMinutes, toInMinutes: toInMinutes, timeOffset: timeOffset });
            // console.log({ timeframesData: timeframesData});
            // debugger;
            if ((fromInMinutes < toInMinutes && timeInMinutes >= fromInMinutes && timeInMinutes <= toInMinutes)
                || ((fromInMinutes > toInMinutes) && (timeInMinutes >= fromInMinutes || timeInMinutes <= toInMinutes))
                || fromInMinutes == toInMinutes) {
                isIncluded = true;
            }
            else isIncluded = false;
        }
        timeFrames = timeFrames.map(item => {
            return {
                from: DateTimeUtils.returnTime(item.from, timeOffset),
                to: DateTimeUtils.returnTime(item.to, timeOffset),
                day: DateTimeUtils.ALL_DAYS.find(day => day.slice(0, 2) === item.day)
            }
        });
        // day = timeFrames.find(item => item.day === this.ALL_DAYS[date.getUTCDay() - 1]);
        day = timeFrames.find(item => item.day === offerDay);
        let index = (item, days) => {
            for (let i = 0; i < 7; i++) {
                if (item.day === days[i]) {
                    return i;
                }
            }
        }
        timeFrames = _.sortBy(timeFrames, function (o) { return index(o, DateTimeUtils.ALL_DAYS) });
        return {
            isIncluded: isIncluded,
            day: day,
            timeFrames: timeFrames
        }
    }

}
