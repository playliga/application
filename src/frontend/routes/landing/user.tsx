/**
 * Collects user information when
 * user starts a new career.
 *
 * @module
 */
import * as Yup from 'yup';
import React from 'react';
import cx from 'classnames';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppStateContext } from '@liga/frontend/redux';
import { AppState } from '@liga/frontend/redux/state';
import { windowDataUpdate } from '@liga/frontend/redux/actions';
import { Constants } from '@liga/shared';
import { CountrySelect, findCountryOptionByValue } from '@liga/frontend/components/select';

/**
 * Defines the form's default values.
 *
 * @constant
 */
const formDefaultValues: AppState['windowData'][Constants.WindowIdentifier.Landing]['user'] = {
  name: '',
  countryId: undefined,
};

/**
 * Defines the form's validation schema.
 *
 * @constant
 */
const formValidationSchema = Yup.object({
  name: Yup.string()
    .max(15, 'Must be 15 characters or less')
    .matches(/^[\w]+$/)
    .required('Required'),
  countryId: Yup.number().required('Required'),
});

/**
 * Exports this module.
 *
 * @exports
 */
export default function () {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, dispatch } = React.useContext(AppStateContext);
  const windowData = state.windowData.landing;

  // form setup
  const { control, formState, handleSubmit } = useForm({
    resolver: yupResolver(formValidationSchema.partial()),
    defaultValues: windowData?.user ? windowData.user : formDefaultValues,
    mode: 'all',
  });

  // load country data
  const countrySelectorData = React.useMemo(() => {
    return state.continents.map((continent) => ({
      label: continent.name,
      options: continent.countries.map((country) => ({
        ...country,
        value: country.id,
        label: country.name,
      })),
    }));
  }, [state.continents]);

  // preload country if one was selected
  const selectedCountry = React.useMemo(() => {
    if (!windowData?.user?.countryId) {
      return null;
    }

    return findCountryOptionByValue(countrySelectorData, windowData.user.countryId);
  }, [countrySelectorData]);

  // handle form submission
  const onSubmit = (user: typeof formDefaultValues) => {
    // save data to redux
    const data = { [Constants.WindowIdentifier.Landing]: { user } };
    dispatch(windowDataUpdate(data));

    // move to next step in form
    const [currentStep] = location.pathname
      .split('/')
      .slice(-1)
      .map((path) => parseInt(path) || 1);
    navigate('/create/' + (currentStep + 1));
  };

  return (
    <form className="stack-y">
      <section className="form-control w-full">
        <label className="label">
          <span className="label-text">Alias</span>
        </label>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <input
              type="text"
              onChange={onChange}
              value={value}
              className={cx(
                'input',
                'input-bordered',
                'w-full',
                !!formState.errors?.name?.message && 'input-error',
              )}
            />
          )}
        />
        <footer className="label h-5">
          <span className="label-text-alt">{formState.errors?.name?.message}</span>
        </footer>
      </section>
      <section className="form-control w-full">
        <label className="label">
          <span className="label-text">Country</span>
        </label>
        <Controller
          control={control}
          name="countryId"
          render={({ field: { onChange } }) => (
            <CountrySelect
              defaultValue={selectedCountry}
              options={countrySelectorData}
              onChange={(option) => onChange(option.value)}
            />
          )}
        />
        <footer className="label h-5">
          <span className="label-text-alt">{formState.errors?.countryId?.message}</span>
        </footer>
      </section>
      <button
        type="submit"
        className="btn btn-primary btn-block"
        onClick={handleSubmit(onSubmit)}
        disabled={
          !formState.isValid ||
          formState.isSubmitting ||
          (!formState.isDirty && formState.defaultValues === formDefaultValues)
        }
      >
        {!!formState.isSubmitting && <span className="loading loading-spinner"></span>}
        Next
      </button>
    </form>
  );
}
