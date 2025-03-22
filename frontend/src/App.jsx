import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Input, Select, Space, Card, Col, Row } from 'antd';
import { AppstoreAddOutlined } from '@ant-design/icons';
import { LogoutOutlined } from '@ant-design/icons';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Footer from './components/Footer';
import { baseUrl } from './constants/constants';

const { Option } = Select;

function App() {
  const [funds, setFunds] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isSecretKeyValid, setIsSecretKeyValid] = useState(false); // State to track secret key validation

  useEffect(() => {
    const storedSecretKey = localStorage.getItem('secretKey');
    if (storedSecretKey === 'your-unique-secret-key') {
      setIsSecretKeyValid(true);
    }
  }, []);

  useEffect(() => {
    if (isSecretKeyValid) {
      axios
        .get('http://localhost:5000/funds')
        .then(response => setFunds(response.data))
        .catch(() => toast.error('Error fetching funds'));

      axios
        .get('http://localhost:5000/expenses')
        .then(response => setExpenses(response.data))
        .catch(() => toast.error('Error fetching expenses'));
    }
  }, [isSecretKeyValid]);

  // Calculate totals
  const totalDonors = [...new Set(funds.map(fund => fund.name))].length;
  const totalCollections = funds.reduce((acc, fund) => acc + parseFloat(fund.amount), 0);
  const totalExpenses = expenses.reduce((acc, expense) => acc + parseFloat(expense.amount), 0);
  const balance = totalCollections - totalExpenses;

  // Validation schema using Yup
  const fundValidationSchema = Yup.object({
    name: Yup.string().min(3, 'Name must be at least 3 characters').required('Name is required'),
    amount: Yup.number().positive('Amount must be a positive number').required('Amount is required'),
    mobileNumber: Yup.string()
      .matches(/^(01[3-9]\d{8})$/, 'Invalid Bangladesh mobile number')
      .required('Mobile number is required'),
    donationType: Yup.string().required('Donation type is required'),
  });

  const expenseValidationSchema = Yup.object({
    description: Yup.string().required('Expense description is required'),
    amount: Yup.number().positive('Amount must be a positive number').required('Amount is required'),
  });

  // Add Fund
  const handleFundSubmit = async (values, { resetForm }) => {
    try {
      const response = await axios.post(`${baseUrl}/add-fund`, values);
      if (response.data.success) {
        toast.success(response.data.message);
        setFunds([...funds, values]);
        resetForm();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Error adding fund');
    }
  };

  // Add Expense
  const handleExpenseSubmit = async (values, { resetForm }) => {
    try {
      const response = await axios.post(`${baseUrl}/add-expense`, values);
      if (response.data.success) {
        toast.success(response.data.message);
        setExpenses([...expenses, values]);
        resetForm();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Error adding expense');
    }
  };

  // Search Funds
  const filteredFunds = funds.filter(
    fund => fund.name.toLowerCase().includes(searchText.toLowerCase()) || fund.transactionId.toLowerCase().includes(searchText.toLowerCase())
  );

  // Date Format Function
  const formatDate = date => new Date(date).toLocaleString();

  const fundColumns = [
    { title: 'S.No', dataIndex: 'serial', key: 'serial', render: (_, __, index) => index + 1 },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount' },
    { title: 'Donation Type', dataIndex: 'donationType', key: 'donationType' },
    { title: 'Mobile Number', dataIndex: 'mobileNumber', key: 'mobileNumber' },
    { title: 'Date', dataIndex: 'date', key: 'date', render: date => formatDate(date) },
    { title: 'Transaction ID', dataIndex: 'transactionId', key: 'transactionId' },
  ];

  const expenseColumns = [
    { title: 'S.No', dataIndex: 'serial', key: 'serial', render: (_, __, index) => index + 1 },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount' },
    { title: 'Date', dataIndex: 'date', key: 'date', render: date => formatDate(date) },
    { title: 'Transaction ID', dataIndex: 'transactionId', key: 'transactionId' },
  ];

  // Handle secret key submission
  const handleSecretKeySubmit = (e) => {
    e.preventDefault();
    const inputKey = e.target.secretKey.value;
    if (inputKey === 'your-unique-secret-key') {
      localStorage.setItem('secretKey', inputKey);
      setIsSecretKeyValid(true);
      toast.success('Secret key is valid');
    } else {
      toast.error('Invalid secret key');
    }
  };

  const handleLogout = () => {
  // Remove the secret key from localStorage to log out the user
  localStorage.removeItem('secretKey');
  toast.success("Logout Successful");
  

  
  // Optionally, you can reload the page or redirect the user
    window.location.reload();  // This will reload the page to reset the UI
};


  return (
    <div className="container">
      <h1 className="title">Fund Collection & Expense Management</h1>

      {/* Secret Key Input Section */}
      {!isSecretKeyValid && (
        <form onSubmit={handleSecretKeySubmit} style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Input
            name="secretKey"
            placeholder="Enter Secret Key"
            type="password"
            style={{
              marginBottom: '20px',
              width: '250px',
              padding: '10px',
              fontSize: '16px',
              borderRadius: '5px',
              border: '2px solid #1890ff',
            }}
          />

          <br />
          <Button
            type="primary"
            htmlType="submit"
            style={{
              backgroundColor: '#4CAF50',
              borderColor: '#4CAF50',
              color: '#fff',
              fontSize: '16px',
              padding: '10px 20px',
              borderRadius: '5px',
              width:"200px"
            }}
          >
            Submit Secret Key
          </Button>
        </form>
      )}

      {/* Total Donors and Total Collections Section */}
      {isSecretKeyValid && (
        <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
          <Col span={12}>
            <Card title="Total Donors" bordered={false} className="stats-card">
              <h2>{totalDonors}</h2>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Total Collections" bordered={false} className="stats-card">
              <h2>${totalCollections.toFixed(2)}</h2>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Total Expenses" bordered={false} className="stats-card">
              <h2>${totalExpenses.toFixed(2)}</h2>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Net Balance" bordered={false} className="stats-card">
              <h2>${balance.toFixed(2)}</h2>
            </Card>
          </Col>
        </Row>
      )}

      {/* Form for Adding Fund */}
      {isSecretKeyValid && (
        <Formik
          initialValues={{ name: '', amount: '', donationType: 'Iftar Mahfil', mobileNumber: '' }}
          validationSchema={fundValidationSchema}
          onSubmit={handleFundSubmit}
        >
          {({ errors, touched }) => (
            <Form className="form fundForm">
              <Space direction="horizontal" size="middle" className="form-inputs">
                <Field name="name" placeholder="Name" as={Input} />
                {errors.name && touched.name && <div>{errors.name}</div>}

                <Field name="amount" type="number" placeholder="Amount" as={Input} />
                {errors.amount && touched.amount && <div>{errors.amount}</div>}

                <Field name="donationType" as={Select} style={{ width: '150px' }}>
                  <Option value="Iftar Mahfil">Iftar</Option>
                  <Option value="Charity" disabled>Charity</Option>
                  <Option value="Zakat" disabled>Zakat</Option>
                  <Option value="Others" disabled>Others</Option>
                </Field>
                {errors.donationType && touched.donationType && <div>{errors.donationType}</div>}

                <Field name="mobileNumber" placeholder="Mobile Number" as={Input} />
                {errors.mobileNumber && touched.mobileNumber && <div>{errors.mobileNumber}</div>}

                <Button type="primary" htmlType="submit" icon={<AppstoreAddOutlined />}>
                  Add Fund
                </Button>
              </Space>
            </Form>
          )}
        </Formik>
      )}

      {/* Form for Adding Expense */}
      {isSecretKeyValid && (
        <Formik
          initialValues={{ description: '', amount: '' }}
          validationSchema={expenseValidationSchema}
          onSubmit={handleExpenseSubmit}
        >
          {({ errors, touched }) => (
            <Form className="form expenceForm">
              <Space direction="horizontal" size="middle" className="form-inputs">
                <Field name="description" placeholder="Expense Description" as={Input} />
                {errors.description && touched.description && <div>{errors.description}</div>}

                <Field name="amount" type="number" placeholder="Amount" as={Input} />
                {errors.amount && touched.amount && <div>{errors.amount}</div>}

                <Button type="primary" htmlType="submit" icon={<AppstoreAddOutlined />}>
                  Add Expense
                </Button>
              </Space>
            </Form>
          )}
        </Formik>
      )}

      {/* Search Box */}
      {isSecretKeyValid && (
        <Input.Search
          placeholder="Search by Name or Transaction ID"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          enterButton
          style={{ marginBottom: '20px', width: '100%' }}
        />
      )}

      {/* Data Table for Funds */}
      {isSecretKeyValid && (
        <div className="fund-table">
          <h2 className="table-title">Fund Collection</h2>
          <Table columns={fundColumns} dataSource={filteredFunds} rowKey="transactionId" className="fund-table" />
        </div>
      )}

      {/* Data Table for Expenses */}
      {isSecretKeyValid && (
        <div className="expense-table">
          <h2 className="table-title">Expenses</h2>
          <Table columns={expenseColumns} dataSource={expenses} rowKey="transactionId" className="expense-table" />
        </div>
      )}

    
      
      {isSecretKeyValid &&   <Button
  type="primary"
  onClick={handleLogout}  // Button's click event triggers handleLogout function
  icon={<LogoutOutlined />}  // Optional logout icon
  style={{ marginBottom: '20px' }}  // Styling (optional)
>
  Logout
      </Button>  }

      <Footer />
      {/* ToastContainer for displaying toast messages */}
      <ToastContainer />
    </div>
  );
}

export default App;
