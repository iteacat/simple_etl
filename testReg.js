var regType = /((?:NO PARKING)|(?:NO STANDING)|(?:NO STOPPING))/
var regTimeRange = /((?:\d{1,2}:{0,1}\d{0,2}(?:AM|PM){0,1})|MIDNIGHT|NOON)-((?:\d{1,2}:{0,1}\d{0,2}(?:AM|PM){0,1})|MIDNIGHT|NOON)/
var regWeekDayRange = /((?:MON|MONDAY|TUES|TUESDAY|WED|WEDNESDAY|THURS|THURSDAY|FRI|FRIDAY|SAT|SATURDAY|SUN|SUNDAY)-{1,1}(?:MON|MONDAY|TUES|TUESDAY|WED|WEDNESDAY|THURS|THURSDAY|FRI|FRIDAY|SAT|SATURDAY|SUN|SUNDAY){1,1})/g;
var regDay = /(MONDAY|MON|TUESDAY|TUES|WEDNESDAY|WED|THURSDAY|THURS|FRIDAY|FRI|SATURDAY|SAT|SUNDAY|SUN)/g;

var regWeekDay = /\b(MONDAY|MON|TUESDAY|TUES|WEDNESDAY|WED|THURSDAY|THURS|FRIDAY|FRI|FR\sI|FR|SATURDAY|SAT|SUNDAY|SUN)\b/g;

//var regTypeAndTimeRange = new RegExp(regType.source + '.*?' + regDay.source + '.*?' + regTimeRange.source, "g");
//var regWeekDay = /\b(MON|MONDAY|TUES|TUESDAY|WED|WEDNESDAY|THURS|THURSDAY|FRI|FRIDAY|SAT|SATURDAY|SUN|SUNDAY)\b/g;
//console.log(regTypeAndTimeRange.source);
//var a;
//while ((a = regWeekDay.exec('because bla bla so NO PARKING MONDAY FRIDAY 1-2PM BUT blabla')) !== null)
    //console.log(a);
//console.log(regTypeAndTimeRange.exec('because bla bla so NO PARKING MONDAY FRIDAY 1-2PM BUT blabla'));
//console.log(regTypeAndTimeRange.exec('NOO PARKING 1-2PM'));

var ignoreExcept = regWeekDay.source + /\s*/.source + '-' + /\s*/.source + regWeekDay.source;
var ignoreExcept = regWeekDay.source + /\s+/.source + 'THRU' + /\s+/.source + regWeekDay.source;
var regIgnoreExcept = new RegExp(ignoreExcept, 'g');
console.log(regIgnoreExcept.exec('MON THRU FRI'));
