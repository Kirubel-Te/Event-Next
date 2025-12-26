import React from 'react'
import ExploreBtn from '@/components/ExploreBtn';
import EventCard from '@/components/EventCard';
import { time } from 'console';

const events = [
  {image: '/images/event1.png', title: 'Tech Conference 2024',slug:'event1',location:'location-1,',date:'2024-09-15',time:'10:00 AM'
  },
  {image: '/images/event2.png', title: 'AI & ML Summit',slug:'event2',location:'location-2',date:'2024-10-20',time:'09:00 AM'},
  {image: '/images/event3.png', title: 'Web Dev Workshop',slug:'event3',location:'location-3',date:'2024-11-05',time:'11:00 AM'},
  {image: '/images/event4.png', title: 'Cloud Expo',slug:'event4',location:'location-4',date:'2024-11-15',time:'08:00 AM'},
  {image: '/images/event5.png', title: 'Cybersecurity Forum',slug:'event5',location:'location-5',date:'2024-12-01',time:'02:00 PM'},
  {image: '/images/event6.png', title: 'Blockchain Meetup',slug:'event6',location:'location-6',date:'2024-12-18',time:'03:30 PM'},
]

const page = () => {
  return (
    <section>
      <h1 className='text-center'>The Hub for Every Dev <br/> Event You Can't Miss</h1>
      <p className='text-center mt-5'>Hackathons Meetups, and Conferences, All in One Place.</p>

      <ExploreBtn />
      <div className='mt-20 space-y-7'>
        <h3>Featured Events</h3>
        <ul className='events list-none'>
          {events.map((event)=>(
            <li key={event.title}>
              <EventCard {...event} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default page
