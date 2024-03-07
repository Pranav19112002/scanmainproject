const express = require('express');
const router = express.Router();
const Booking = require('../model/book'); // Assuming you've created the Booking model
const Scan = require("../model/scan");

// POST route for booking a scan
router.post('/bookscan', async (req, res) => {
  try {
    const { userId,userEmail, pname, page, scanId, scanName, scanType, totalAmount, selectedDate } = req.body;

    // Create a new booking instance with the status initially set to 'pending'
    const newBooking = new Booking({
      userid: userId,
      useremail: userEmail,
      pname: pname,
      page: page,
      scanid: scanId,
      scanname: scanName,
      scantype: scanType,
      totalamount: totalAmount,
      selectedDate: selectedDate,
      status: 'pending'
    });

    // Save the booking to the database
    const savedBooking = await newBooking.save();

    // Fetch the scan details based on scanId
    const scan = await Scan.findById(scanId);

    // Check if the scan exists
    if (scan) {
      // Push the entire booking object to the currentbookings array of the scan
      scan.currentbookings.push(savedBooking);
      // Save the updated scan details
      await scan.save();

      // Update the status of the booking to 'booked'
      savedBooking.status = 'booked';
      // Save the updated booking status
      await savedBooking.save();
    } else {
      // Handle case where scan is not found
      console.log('Scan not found');
    }

    // Respond with the saved booking data
    res.status(201).json(savedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/allbookings', async (req, res) => {
    try {
      // Fetch all bookings from the database
      const allBookings = await Booking.find();
      
      // Respond with the array of bookings
      res.status(200).json(allBookings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.get('/getallbookingsbyuserid', async (req, res) => {
    try {
      // Extract the user ID from the request query parameters
      const { userId } = req.query;
  
      // Fetch all bookings for the specified user ID
      const userBookings = await Booking.find({ userid: userId });
  
      // Respond with the array of bookings for the user
      res.status(200).json(userBookings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.post('/cancelbooking', async (req, res) => {
    try {
        // Extract the booking ID from the request body
        const { bookingid } = req.body;

        // Fetch the booking by ID
        const booking = await Booking.findById(bookingid);

        // Check if the booking exists
        if (booking) {
            // Update the status to 'cancelled'
            booking.status = 'cancelled';
            // Save the updated booking status
            await booking.save();

            // Fetch the scan details based on scanId
            const scan = await Scan.findById(booking.scanid);

            // Check if the scan exists
            if (scan) {
                // Remove the cancelled booking from the currentbookings array of the scan
                scan.currentbookings = scan.currentbookings.filter(
                    (currentBooking) => currentBooking.toString() !== bookingid
                );
                // Save the updated scan details
                await scan.save();
            } else {
                // Handle case where scan is not found
                console.log('Scan not found');
            }

            // Respond with a success message
            res.status(200).json({ message: 'Booking cancelled successfully' });
        } else {
            // Handle case where booking is not found
            res.status(404).json({ error: 'Booking not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

  
  
  module.exports = router;


module.exports = router;
