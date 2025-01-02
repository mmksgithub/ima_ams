import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { State, City } from 'country-state-city';
import {
  TextField,
  Button,
  Grid,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import MainCard from 'ui-component/cards/MainCard';

const SpecialityData = [
  { speciality: 'Cardiology', code: 'C01' },
  { speciality: 'Dermatology', code: 'D02' },
  { speciality: 'Neurology', code: 'N03' },
];

const AddMember = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const { control, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    const fetchStates = async () => {
      const result = State.getStatesOfCountry("IN");
      const allStates = result?.map(({ isoCode, name }) => ({
        value: isoCode,
        label: name,
      }));
      setStates(allStates || []);
    };
    fetchStates();
  }, []);

  const handleStateChange = (e) => {
    const stateCode = e.target.value;
    setSelectedState(stateCode);

    const selectedStateObj = states.find((state) => state.value === stateCode);
    const stateName = selectedStateObj ? selectedStateObj.label : "";

    if (stateCode) {
      const result = City.getCitiesOfState("IN", stateCode);
      const allCities = result?.map(({ name }) => ({
        value: name,
        label: name,
      }));
      setCities(allCities || []);
    } else {
      setCities([]);
    }
  };

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
  };

  const onSubmit = (data) => {
    const finalData = {
      ...data,
      state: selectedState,
      city: selectedCity,
    };
    console.log("Submitted Data:", finalData);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Uploaded file:", file);
    }
  };

  return (
    <MainCard title="Add New Member">
      <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* First Name */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="fname"
              control={control}
              rules={{ required: 'First Name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="First Name"
                  error={!!errors.fname}
                  helperText={errors.fname?.message}
                  variant="outlined"
                />
              )}
            />
          </Grid>

          {/* Last Name */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="lName"
              control={control}
              rules={{ required: 'Last Name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Last Name"
                  error={!!errors.lName}
                  helperText={errors.lName?.message}
                  variant="outlined"
                />
              )}
            />
          </Grid>

          {/* Gender */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="gender"
              control={control}
              rules={{ required: 'Gender is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Gender"
                  error={!!errors.gender}
                  helperText={errors.gender?.message}
                  variant="outlined"
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                </TextField>
              )}
            />
          </Grid>

          {/* State */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="state-label">State</InputLabel>
              <Select
                labelId="state-label"
                value={selectedState}
                onChange={handleStateChange}
              >
                <MenuItem value="">Select State</MenuItem>
                {states.map((state) => (
                  <MenuItem key={state.value} value={state.value}>
                    {state.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* City */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="city-label">City</InputLabel>
              <Select
                labelId="city-label"
                value={selectedCity}
                onChange={handleCityChange}
              >
                <MenuItem value="">Select City</MenuItem>
                {cities.map((city) => (
                  <MenuItem key={city.value} value={city.value}>
                    {city.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* File Upload */}
          <Grid item xs={12}>
            <Typography variant="h6">Upload Photo</Typography>
            <Button variant="contained" component="label">
              Upload Image
              <input
                type="file"
                hidden
                accept=".jpg, .png, .jpeg"
                onChange={handleFileChange}
              />
            </Button>
          </Grid>
          <Grid item xs={12}>
  <Typography variant="h6">Upload Document</Typography>
  <Button variant="contained" component="label">
    Upload PDF
    <input
      type="file"
      hidden
      accept=".pdf"
    onChange={handleFileChange}
    />
  </Button>
</Grid>


          {/* Submit Button */}
          <Grid item xs={12}>
            <Button type="submit" variant="contained" size="large">
              Submit
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => reset()}
              style={{ marginLeft: '1rem' }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Box>
    </MainCard>
  );
};

export default AddMember;
