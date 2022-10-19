import { Numerator } from "./Numerator";
import { Field, Form, Formik } from "formik";

export const App = () => {
  return (
    <Formik initialValues={{}} onSubmit={() => undefined}>
      <Form>
        <Field name="numerator" label="Шаблон номера" component={Numerator} />
      </Form>
    </Formik>
  );
};
