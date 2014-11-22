package imodv6

import org.joda.time.LocalTime;
import org.jadira.usertype.dateandtime.joda.*
/**
 * TODO the schedule section may need to be refactored
 */

/**
 * Store all of the general information on when the course will happen
 * @param startDate first date classes occur
 * @param endDate last date classes occur
 * @param startTime start time of class
 * @param endDate end time of class
 * @param repeats Schedule repeats id 
 * @param repeatsEvery schedule repeats every for weekly schedule repeats value
 */
class Schedule {
	Date startDate
	Date endDate
	LocalTime startTime
	LocalTime endTime
	ScheduleRepeats repeats
	ScheduleRepeatsEvery repeatsEvery

	static belongsTo = [
		imod: Imod
	]
	
	static hasMany = [
		scheduleWeekDays: ScheduleWeekDays
		]

    static constraints = {
		repeats			nullable: true
		repeatsEvery	nullable: true
		endDate         validator: {endDate, schedule -> return endDate >= schedule.startDate}
		endTime			validator: {endTime, schedule -> return endTime > schedule.startTime}
		
    }

	static mapping = {
		version false
		repeats lazy:false
		repeatsEvery lazy:false
		startTime type: PersistentLocalTime
		endTime   type: PersistentLocalTime
	}
	
	
}
